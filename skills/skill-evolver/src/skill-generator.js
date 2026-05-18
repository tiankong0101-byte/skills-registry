const { SurrogateVerifier } = require('./surrogate-verifier');
const { AAAKCompressor, AAAKContextBuilder, estimateTokens } = require('./aaak-compressor');

const GENERATOR_PROMPT = `You are a Skill Generator — you improve Skill content based on verification feedback.

## Your Role
Given a current Skill and verification feedback, generate an improved version.

## Feedback Types
1. **Assertion Failures**: Specific checks that failed
2. **Missing Coverage**: Cases the Skill doesn't handle
3. **Style Issues**: Unclear instructions, missing examples
4. **Structural Problems**: Bad organization, missing sections

## Generation Rules
1. Preserve what works — don't change successful parts unnecessarily
2. Fix specific failures first — address each failed assertion
3. Improve clarity — make instructions unambiguous
4. Add examples if missing — concrete examples prevent failures
5. Maintain format — keep SKILL.md structure consistent

## Important
- You receive VERIFICATION FEEDBACK only — not the verifier's internal reasoning
- Focus on actionable fixes
- If the Skill already passes, make minimal improvements
- Keep the skill concise — don't bloat the context window`;

class SkillGenerator {
  constructor(llmClient) {
    this.llm = llmClient;
    this.verifier = new SurrogateVerifier(llmClient);
    this.compressor = new AAAKCompressor();
    this.contextBuilder = new AAAKContextBuilder(this.compressor);
    this.maxContextTokens = 3500;
  }

  async generateImprovedVersion(currentContent, feedback, context) {
    const prompt = this.buildGenerationPrompt(currentContent, feedback, context);
    const tokCount = estimateTokens(prompt);
    if (tokCount > this.maxContextTokens) {
      console.log(`    [Generator] Prompt ${tokCount}toks (${prompt.length}chars) > ${this.maxContextTokens}, using AAAK compression`);
    }

    const response = await this.llm.complete(prompt, {
      temperature: 0.5,
      maxTokens: 8192
    });

    const improved = this.extractSkillContent(response.content);
    if (!improved) {
      console.log('    [Generator] Could not extract improved content from LLM response');
      return currentContent;
    }
    if (improved === currentContent) {
      console.log(`    [Generator] LLM returned identical content`);
      return currentContent;
    }
    const diff = improved.length - currentContent.length;
    console.log(`    [Generator] Improved (+${diff > 0 ? '+' : ''}${diff} chars)`);
    return improved;
  }

  async patchImprove(currentContent, feedback) {
    const failedAssertions = (feedback.assertion_results || []).filter(a => !a.passed);

    const prompt = `You are improving an existing SKILL.md by inserting specific improvements.

## Original SKILL.md
${currentContent}

## Failed Assertions to Fix
${failedAssertions.map((a, i) => `
### ${i + 1}. ${a.assertion}
Evidence: ${a.evidence}
Fix suggestion: ${a.suggestion}
`).join('\n')}

## Task
For each failed assertion, identify where in the original SKILL.md the fix should go, and provide a PATCH that adds or modifies content.

Return a JSON object:
{
  "patches": [
    {
      "section": "which section to modify",
      "action": "insert|replace|add",
      "content": "the content to add or replace with",
      "reason": "which assertion this fixes"
    }
  ]
}

Focus on actionable, specific additions. Return JSON only.`;

    try {
      const response = await this.llm.complete(prompt, { temperature: 0.3, maxTokens: 2048 });
      const match = response.content.match(/\{[\s\S]*\}/);
      if (!match) {
        console.log('    [Generator] Could not parse patch JSON');
        return currentContent;
      }

      const patches = JSON.parse(match[0]).patches || [];
      if (patches.length === 0) {
        console.log('    [Generator] No patches generated');
        return currentContent;
      }

      let improved = currentContent;
      for (const patch of patches) {
        if (patch.action === 'add') {
          const sectionMatch = improved.match(new RegExp(`(${patch.section})`, 'i'));
          if (sectionMatch) {
            const idx = improved.indexOf(sectionMatch[0]) + sectionMatch[0].length;
            improved = improved.slice(0, idx) + '\n' + patch.content + improved.slice(idx);
          }
        } else if (patch.action === 'replace') {
          improved = improved.replace(new RegExp(patch.section, 'i'), patch.content);
        }
      }

      console.log(`    [Generator] Applied ${patches.length} patches`);
      return improved;
    } catch (e) {
      console.log('    [Generator] Patch failed:', e.message);
      return currentContent;
    }
  }

  buildGenerationPrompt(currentContent, feedback, context) {
    const history = context.history || [];
    const failedAssertions = (feedback.assertion_results || []).filter(a => !a.passed);
    const hallFailures = context.hallFailures || [];
    const hallSuggestions = context.hallSuggestions || [];

    const allFailures = [...new Map([
      ...failedAssertions.map(f => [f.assertion, f]),
      ...hallFailures
        .filter(f => typeof f === 'object' && f.assertion)
        .map(f => [f.assertion, f])
    ]).values()];

    const historicalContext = hallFailures.length > 0 ? `
## Historical Failures (from previous evolution rounds)
${hallFailures.slice(-10).map((f, i) => {
  if (typeof f === 'string') return `${i + 1}. ${f}`;
  return `${i + 1}. Assertion: "${f.assertion}"
   Evidence: ${f.evidence || 'N/A'}
   Suggested Fix: ${f.suggestion || 'N/A'}`;
}).join('\n')}` : '';

    const skillToks = estimateTokens(currentContent);
    let skillSection = currentContent;
    if (skillToks > 2000) {
      const compressed = this.compressor.compress(currentContent);
      const compressedToks = estimateTokens(compressed);
      if (compressedToks < skillToks * 0.85) {
        console.log(`    [Generator] AAAK compressed skill: ${skillToks} -> ${compressedToks} tokens`);
        skillSection = `[SKILL:AAAK_COMPRESSED]\n${compressed}`;
      }
    }

    return `You are a SKILL.md expert. Your task is to regenerate and improve a SKILL.md file.

## Palace Memory Context
This skill has undergone ${history.length} previous evolution round(s).
${historicalContext}

## Original SKILL.md
${skillSection}

## Verification Results
- Score: ${(feedback.score * 100).toFixed(0)}%
- Passed: ${(feedback.assertion_results || []).filter(a => a.passed).length}
- Failed: ${failedAssertions.length}

## Critical Fixes Required (top 3)
${allFailures.slice(0, 5).map((a, i) => `
${i + 1}. "${a.assertion}"
   Problem: ${a.evidence || 'See historical failures above'}
   Fix: ${a.suggestion || 'Review pattern from historical failures'}
`).join('\n')}

## Your Task
Regenerate the COMPLETE improved SKILL.md. Output ONLY the final SKILL.md content wrapped in \`\`\`markdown\`\`\` code block. Do not include any explanation, analysis, or preamble. Just the improved skill. The output must be at least as long as the original. Focus on fixing the failed assertions while preserving what works.`;
  }

  extractSkillContent(response) {
    if (!response) return null;
    const match = response.match(/```(?:markdown)?\s*\n?([\s\S]*?)```/);
    if (match && match[1].trim().length > 200) return match[1].trim();
    if (response.includes('---') && response.includes('# ')) {
      const startIdx = response.indexOf('---');
      const endIdx = response.lastIndexOf('---');
      if (endIdx > startIdx) return response.slice(startIdx, response.length).trim();
    }
    return null;
  }

  async generateFromScratch(baseContext, taskDescription) {
    const prompt = `## Task Description
${taskDescription}

## Skill Metadata
- Name: ${baseContext.skillName}
- Category: ${baseContext.category || 'general'}
- Tags: ${(baseContext.tags || []).join(', ')}

## SKILL.md Template
\`\`\`markdown
---
name: <skill-name>
description: "..."
---

# <Skill Title>

[Skill description and capabilities]

## When to Use

[When this skill should be triggered]

## Core Features

[Main functionality]

## Usage

[How to use this skill]

## Examples

[Concrete examples]
\`\`\`

Generate a complete SKILL.md for this skill following the template. Be thorough and specific. Return the complete SKILL.md in a markdown code block.`;

    const response = await this.llm.complete(prompt, { temperature: 0.7, maxTokens: 8192 });
    return this.extractSkillContent(response.content) || '';
  }
}

module.exports = { SkillGenerator };
