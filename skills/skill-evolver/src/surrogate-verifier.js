const VERIFICATION_PROMPT = `You are a Surrogate Verifier — an **independent** LLM session that evaluates Skill quality. You are completely isolated from the Skill Generator.

## Your Task
Evaluate whether a given Skill correctly handles a test case by checking its output against expected assertions.

## Critical Rules
1. You CANNOT see the Skill Generator's internal reasoning — only the final Skill content and test case
2. You CANNOT be influenced by the Generator's preferences or biases
3. Your evaluation must be STRICT — if an assertion is not clearly satisfied, mark it as FAILED
4. You should think adversarially — ask "how could this Skill fail this test?"

## Input Format
You will receive:
- **Skill Content**: The full SKILL.md content
- **Test Case**:
  - **Prompt**: The input task
  - **Expected Output**: What the Skill should do
  - **Assertions**: Specific checks to verify correctness

## Output Format
Return a JSON object:
{
  "eval_id": <number>,
  "passed": true/false,
  "score": 0.0-1.0,
  "assertion_results": [
    {
      "assertion": "the assertion text",
      "passed": true/false,
      "evidence": "why it passed or failed",
      "suggestion": "how to fix if failed"
    }
  ],
  "overall_feedback": "brief explanation of pass/fail reason",
  "confidence": 0.0-1.0
}

## Verification Process
1. Read the Skill content carefully
2. Simulate executing the Skill on the given prompt
3. Check each assertion one by one
4. Assign a score based on how many assertions passed
5. Provide actionable suggestions for failures

Be thorough, be critical, be fair.`;

class SurrogateVerifier {
  constructor(llmClient) {
    this.llm = llmClient;
  }

  async verify(skillContent, evalCase, strategy = null) {
    const userPrompt = this.buildPrompt(skillContent, evalCase, strategy);
    try {
      const response = await this.llm.verifyComplete(VERIFICATION_PROMPT, userPrompt);
      return this.parseResponse(response.content, evalCase);
    } catch (error) {
      return {
        passed: false,
        score: 0,
        assertion_results: [],
        overall_feedback: `Verification error: ${error.message}`,
        confidence: 0,
        eval_id: evalCase.id
      };
    }
  }

  buildPrompt(skillContent, evalCase, strategy = null) {
    const suffix = strategy?.verifierPromptSuffix || '';
    return `## Skill Content (SKILL.md)
\`\`\`markdown
${skillContent}
\`\`\`

## Test Case
- **ID**: ${evalCase.id}
- **Prompt**: ${evalCase.prompt}
- **Expected Output**: ${evalCase.expected_output || 'Not specified'}
- **Assertions to Check**:
${(evalCase.assertions || []).map((a, i) => `  ${i + 1}. ${a}`).join('\n')}
${evalCase.files && evalCase.files.length > 0 ? `- **Supporting Files**: ${evalCase.files.join(', ')}` : ''}
${suffix ? `\n## Skill-Type Specific Checks\n${suffix}` : ''}

## Your Evaluation
Evaluate the Skill against this test case. For each assertion, determine if it is satisfied.
If the Skill would correctly handle this test, mark it passed. If it would fail, explain WHY and HOW to fix it.
Return your evaluation as a JSON object.`;
  }

  parseResponse(content, evalCase) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        eval_id: evalCase.id,
        passed: parsed.passed ?? (parsed.score >= 0.8),
        score: parsed.score ?? 0,
        assertion_results: parsed.assertion_results || [],
        overall_feedback: parsed.overall_feedback || '',
        confidence: parsed.confidence ?? 0.5,
        raw: content
      };
    } catch (e) {
      return {
        eval_id: evalCase.id,
        passed: false,
        score: 0,
        assertion_results: [],
        overall_feedback: `Parse error: ${e.message}. Raw: ${content.substring(0, 300)}`,
        confidence: 0,
        raw: content
      };
    }
  }

  async verifyBatch(skillContent, evalCases, strategy = null) {
    const results = [];
    for (const evalCase of evalCases) {
      const result = await this.verify(skillContent, evalCase, strategy);
      results.push(result);
    }
    return results;
  }
}

module.exports = { SurrogateVerifier };
