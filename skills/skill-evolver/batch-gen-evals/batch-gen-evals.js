#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '..', '..');
const EVALS_DIR = path.join(__dirname, '..', 'evals');

const { LLMClient } = require('../src/llm-client');

const PRIORITY_SKILLS = [
  'skill-creator',
  'systematic-debugging',
  'debug-pro',
  'abm-ad-creative',
  'self-improving',
  'capability-evolver',
  'clawlist',
  'brainstorming',
  'doing-tasks',
  'write-plan',
  'agent-browser',
  'ffmpeg-cli',
  'image',
  'minimax-pdf',
  'minimax-xlsx',
  'minimax-docx',
  'frontend-dev',
  'fullstack-dev',
  'react-native-dev',
  'flutter-dev',
  'ai-content-gen',
  'deep-research-pro',
  'viral-article-deconstructor',
  'craft-habit',
  'humanizer'
];

const llm = new LLMClient();

async function generateEvals(skillName) {
  const skillPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  if (!fs.existsSync(skillPath)) {
    console.log(`  [SKIP] ${skillName} - SKILL.md not found`);
    return;
  }

  const existingEvalPath = path.join(EVALS_DIR, skillName, 'evals.json');
  if (fs.existsSync(existingEvalPath)) {
    console.log(`  [SKIP] ${skillName} - evals.json already exists`);
    return;
  }

  const skillContent = fs.readFileSync(skillPath, 'utf-8');

  const prompt = `Analyze the following SKILL.md and generate a comprehensive eval assertion suite with at least 5 test cases.

Return as JSON matching this schema:
{
  "skill_name": "${skillName}",
  "evals": [
    {
      "id": 1,
      "prompt": "realistic user input that should trigger this skill",
      "expected_output": "what the skill should do in response",
      "assertions": ["specific check 1", "specific check 2"],
      "files": []
    }
  ]
}

## SKILL.md Content:
${skillContent}

Generate ${skillContent.length > 5000 ? '3' : '5'} test cases covering: core functionality, edge cases, error handling, and trigger phrases. Return JSON only.`;

  console.log(`  Generating evals for ${skillName}...`);

  try {
    const response = await llm.complete(prompt, { temperature: 0.3, maxTokens: 4096 });

    const match = response.content.match(/\{[\s\S]*\}/);
    const jsonContent = match ? match[0] : response.content;

    let evals = JSON.parse(jsonContent);

    if (!evals.evals || !Array.isArray(evals.evals)) {
      console.log(`  [WARN] ${skillName} - Invalid evals format, skipping`);
      return;
    }

    const evalDir = path.join(EVALS_DIR, skillName);
    if (!fs.existsSync(evalDir)) {
      fs.mkdirSync(evalDir, { recursive: true });
    }

    fs.writeFileSync(path.join(evalDir, 'evals.json'), JSON.stringify(evals, null, 2));
    console.log(`  [OK] ${skillName} - ${evals.evals?.length || 0} evals generated`);
  } catch (e) {
    console.error(`  [ERROR] ${skillName}: ${e.message}`);
  }
}

async function main() {
  console.log('Batch Evals Generator');
  console.log('Skills dir:', SKILLS_DIR);
  console.log('Evals dir:', EVALS_DIR);
  console.log(`\nProcessing ${PRIORITY_SKILLS.length} priority skills...\n`);

  for (const skill of PRIORITY_SKILLS) {
    await generateEvals(skill);
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\nDone.');
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
