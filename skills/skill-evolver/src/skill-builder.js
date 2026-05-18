class SkillBuilder {
  constructor(llmClient) {
    this.llm = llmClient;
  }

  async build(proposal) {
    const prompt = `You are a SkillBuilder Agent — you create SKILL.md files from high-level proposals.

## Skill Proposal
${JSON.stringify(proposal, null, 2)}

## Your Task
Generate a complete, production-ready SKILL.md file based on the proposal.

## SKILL.md Template Structure

\`\`\`markdown
---
name: <skill-name>
description: "One-line description of what this skill does. Trigger phrases: <triggers>"
version: 1.0.0
---

# <Skill Title>

<Detailed description of the skill>

## When to Use

<When this skill should be triggered>

## Core Features

<List the main features>

## Workflow

<Step-by-step workflow>

## Examples

### Example 1
<Concrete example with input/output>

## Edge Cases

<How to handle edge cases>

## Related Skills

<What other skills this relates to>
\`\`\`

## Guidelines
1. Use concise language — context window is precious
2. Include concrete examples
3. Be specific about trigger phrases
4. Handle error cases
5. Include eval assertion schema at the end

## Eval Schema (include this section)
Add an "## Eval Assertions" section with test cases:
- ID, prompt, expected output, assertions array

Return the complete SKILL.md in a markdown code block.`;

    try {
      const response = await this.llm.complete(prompt, {
        temperature: 0.5,
        maxTokens: 8192
      });

      const match = response.content.match(/```(?:markdown)?\n?([\s\S]*?)```/);
      if (match) return match[1].trim();

      if (response.content.includes('---') && response.content.includes('# ')) {
        return response.content.trim();
      }

      return response.content.trim();
    } catch (e) {
      return this.fallbackBuild(proposal);
    }
  }

  fallbackBuild(proposal) {
    const name = proposal.name || 'new-skill';
    const description = proposal.description || proposal.suggestedSkill?.description || 'New skill';
    const triggers = (proposal.triggers || proposal.suggestedSkill?.triggers || []).join(', ');

    return `---
name: ${name}
description: "${description}. Triggers: ${triggers}"
version: 1.0.0
---

# ${name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

${description}

## When to Use

This skill is triggered when: ${triggers || 'the user requests related tasks'}

## Core Features

- Feature 1
- Feature 2

## Usage

1. Step 1
2. Step 2

## Examples

### Example 1
**Input**: ...
**Output**: ...

## Eval Assertions

\`\`\`json
{
  "skill_name": "${name}",
  "evals": [
    {
      "id": 1,
      "prompt": "Test prompt",
      "expected_output": "Expected behavior",
      "assertions": ["assertion 1", "assertion 2"]
    }
  ]
}
\`\`\`
`;
  }
}

module.exports = { SkillBuilder };
