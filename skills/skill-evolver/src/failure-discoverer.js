const fs = require('fs');
const path = require('path');

class FailureDiscoverer {
  constructor(llm, memoryDir) {
    this.llm = llm;
    this.memoryDir = memoryDir;
  }

  extractFailures(memory) {
    if (!memory || !memory.history) return [];
    return memory.history.filter(h =>
      h.outcome === 'failed' ||
      h.passed === false ||
      (h.feedback && h.feedback.includes('fail'))
    );
  }

  async analyzePatterns(failures) {
    if (failures.length === 0) return [];

    const prompt = `You are a Proposer Agent analyzing failure patterns from Skill execution history.

## Failure Records
${failures.map((f, i) => `
### Failure ${i + 1}
- Task: ${f.task || f.prompt || 'Unknown'}
- Error: ${f.error || f.message || f.feedback || 'Unknown'}
- Skill: ${f.skillName || 'Unknown'}
- Timestamp: ${f.timestamp || 'Unknown'}
`).join('\n')}

## Your Task
Analyze these failures and identify **recurring patterns** that suggest missing or inadequate Skills.

For each pattern, provide:
1. **Pattern Name**: A descriptive name
2. **Description**: What the pattern means
3. **Root Cause**: Why this keeps happening
4. **Suggested Skill**: What Skill would address this
5. **Priority**: high/medium/low

Return as JSON array:
[
  {
    "name": "pattern-name",
    "description": "...",
    "rootCause": "...",
    "suggestedSkill": {
      "name": "skill-name",
      "description": "what this skill should do",
      "triggers": ["trigger phrase 1", "trigger phrase 2"],
      "priority": "high"
    }
  }
]

Focus on patterns that appear 2+ times or have high impact.`;

    try {
      const response = await this.llm.complete(prompt, { temperature: 0.3, maxTokens: 4096 });
      const match = response.content.match(/\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
      return [];
    } catch (e) {
      console.error('[FailureDiscoverer] Analysis error:', e.message);
      return [];
    }
  }

  async propose(pattern) {
    const prompt = `You are a Proposer Agent — you suggest new Skills based on failure patterns.

## Failure Pattern
- Pattern: ${pattern.name}
- Description: ${pattern.description}
- Root Cause: ${pattern.rootCause}
- Suggested Skill: ${JSON.stringify(pattern.suggestedSkill)}

## Your Task
Create a detailed Skill proposal that addresses this failure pattern.

The proposal should include:
1. **Skill Name**: snake-case, descriptive
2. **Description**: One-sentence summary
3. **Triggers**: When should this Skill activate (user phrases)
4. **Core Logic**: Step-by-step workflow
5. **Success Criteria**: How to measure if it works
6. **Dependencies**: What other Skills it needs
7. **Priority**: high/medium/low

Return as JSON object.`;

    try {
      const response = await this.llm.complete(prompt, { temperature: 0.5, maxTokens: 4096 });
      const match = response.content.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      return pattern.suggestedSkill;
    } catch (e) {
      return pattern.suggestedSkill;
    }
  }

  trackFailure(failure) {
    const failures = this.loadFailureLog();
    failures.push({
      ...failure,
      timestamp: new Date().toISOString()
    });
    this.saveFailureLog(failures.slice(-500));
    return failures;
  }

  loadFailureLog() {
    const logPath = path.join(this.memoryDir, 'failures.json');
    if (fs.existsSync(logPath)) {
      try {
        return JSON.parse(fs.readFileSync(logPath, 'utf-8'));
      } catch {
        return [];
      }
    }
    return [];
  }

  saveFailureLog(failures) {
    if (!fs.existsSync(this.memoryDir)) {
      fs.mkdirSync(this.memoryDir, { recursive: true });
    }
    const logPath = path.join(this.memoryDir, 'failures.json');
    fs.writeFileSync(logPath, JSON.stringify(failures, null, 2));
  }
}

module.exports = { FailureDiscoverer };
