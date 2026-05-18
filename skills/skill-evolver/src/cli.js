#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { SkillEvolver } = require('./index');
const path = require('path');

const [, , command, arg, ...rest] = process.argv;
const opts = {
  evalsDir: process.env.EVOLVER_EVALS_DIR || path.join(__dirname, '..', 'evals'),
  memoryDir: process.env.EVOLVER_MEMORY_DIR || path.join(__dirname, '..', 'memory'),
  evolveDir: process.env.EVOLVER_EVOLVE_DIR || path.join(__dirname, '..', '.evolve')
};

function parseFlags(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    }
  }
  return flags;
}

const flags = parseFlags(rest);

async function main() {
  if (!command) {
    printUsage();
    return;
  }

  const skillName = arg;

  switch (command) {
    case 'evolve': {
      if (!skillName) { console.error('Usage: evolve <skill-name> [--rounds 5] [--review]'); process.exit(1); }
      const evolver = new SkillEvolver(skillName, opts);
      const rounds = parseInt(flags.rounds || process.env.EVOLVER_MAX_ROUNDS || '5');
      if (flags.review) process.env.EVOLVER_REVIEW_MODE = 'true';
      await evolver.evolve(rounds);
      break;
    }

    case 'verify': {
      if (!skillName) { console.error('Usage: verify <skill-name> [--eval-id N]'); process.exit(1); }
      const evolver = new SkillEvolver(skillName, opts);
      await evolver.verify(flags['eval-id'] ? parseInt(flags['eval-id']) : null);
      break;
    }

    case 'verify-all': {
      const evolver = new SkillEvolver('all', opts);
      const parallel = parseInt(flags.parallel || '4');
      await evolver.verifyAll(parallel);
      break;
    }

    case 'status': {
      const name = arg || flags.skill || skillName || 'all';
      const evolver = new SkillEvolver(name, opts);
      await evolver.status();
      break;
    }

    case 'pareto': {
      if (!arg && !skillName) { console.error('Usage: pareto <skill-name>'); process.exit(1); }
      const evolver = new SkillEvolver(arg || skillName, opts);
      const report = await evolver.pareto();
      console.log(JSON.stringify(report, null, 2));
      break;
    }

    case 'discover': {
      const name = arg || flags.skill || null;
      const evolver = new SkillEvolver(name || 'discover', opts);
      if (flags.review) process.env.EVOLVER_REVIEW_MODE = 'true';
      await evolver.discover(true, name);
      break;
    }

    case 'cross-test': {
      if (!arg && !skillName) { console.error('Usage: cross-test <skill-name> [--models gpt-4o,claude-sonnet-4]'); process.exit(1); }
      const evolver = new SkillEvolver(arg || skillName, opts);
      const models = flags.models ? flags.models.split(',') : [];
      await evolver.crossTest(models);
      break;
    }

    case 'rollback': {
      if (!arg && !skillName) { console.error('Usage: rollback <skill-name> [--version v1]'); process.exit(1); }
      const evolver = new SkillEvolver(arg || skillName, opts);
      const result = await evolver.rollback(flags.version || null);
      if (result) {
        console.log(`Rolled back to round ${result.round}, timestamp: ${result.timestamp}`);
      }
      break;
    }

    case 'init-evals': {
      if (!skillName) { console.error('Usage: init-evals <skill-name>'); process.exit(1); }
      await initEvals(skillName, opts);
      break;
    }

    case 'install-hook': {
      const { AutoSaveHook } = require('./auto-save');
      const hook = new AutoSaveHook(opts.evolveDir || path.join(__dirname, '..', '.evolve'));
      const hookPath = hook.installHook();
      console.log(`[Hook] Installed at: ${hookPath}`);
      console.log('[Hook] Add to OpenCode config:');
      console.log(`  hooks:\n    PostVerify:\n      - type: command\n        command: ${hookPath} "<skill-name>"`);
      break;
    }

    case 'palace-stats': {
      const { PalaceStore } = require('./palace-store');
      const store = new PalaceStore(opts.evolveDir || path.join(__dirname, '..', '.evolve'));
      await store.init();
      console.log(JSON.stringify(store.stats(), null, 2));
      const wings = store.listWings();
      for (const wing of wings) {
        const report = store.paretoReport(wing.id);
        console.log(`\n${wing.name}: ${report.active}/${report.total} active versions, best=${report.best?.passRate}`);
      }
      store.close();
      break;
    }

    case 'help': {
      printUsage();
      break;
    }

    default: {
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
    }
  }
}

async function initEvals(skillName, opts) {
  const { SkillEvolver } = require('./index');
  const evolver = new SkillEvolver(skillName, opts);
  const skillPath = evolver.findSkillPath();

  if (!skillPath) {
    console.error(`Skill "${skillName}" not found`);
    process.exit(1);
  }

  const { LLMClient } = require('./llm-client');
  const llm = new LLMClient();

  const skillContent = require('fs').readFileSync(skillPath, 'utf-8');

  const prompt = `Analyze the following SKILL.md and generate a comprehensive eval assertion suite.

Generate test cases that cover:
1. Core functionality (must-pass assertions)
2. Edge cases (boundary conditions)
3. Error handling (what happens with bad input)
4. Trigger phrases (does the skill activate correctly)

For each test case, provide:
- id: unique number
- prompt: realistic user input
- expected_output: what the skill should do
- assertions: specific checks (pass/fail criteria)
- files: any supporting files needed

Return as JSON matching this schema:
{
  "skill_name": "${skillName}",
  "evals": [
    {
      "id": 1,
      "prompt": "...",
      "expected_output": "...",
      "assertions": ["..."],
      "files": []
    }
  ]
}

## SKILL.md Content:
${skillContent}

Generate at least 5 comprehensive test cases. Return as JSON only.`;

  console.log('Generating eval assertions...');
  const response = await llm.complete(prompt, { temperature: 0.3, maxTokens: 8192 });

  const match = response.content.match(/\[[\s\S]*\]/);
  const jsonContent = match ? match[0] : response.content;

  let evals;
  try {
    evals = JSON.parse(jsonContent);
  } catch {
    console.error('Failed to parse generated evals. Raw response:');
    console.error(response.content.substring(0, 1000));
    process.exit(1);
  }

  const evalDir = path.join(opts.evalsDir, skillName);
  if (!require('fs').existsSync(evalDir)) {
    require('fs').mkdirSync(evalDir, { recursive: true });
  }

  const evalPath = path.join(evalDir, 'evals.json');
  require('fs').writeFileSync(evalPath, JSON.stringify(evals, null, 2));
  console.log(`Wrote ${evals.evals?.length || 0} eval cases to: ${evalPath}`);
}

function printUsage() {
  console.log(`
Skill Evolver CLI — Auto-evolution framework for OpenCode Skills

Usage:
  node src/cli.js <command> [args] [flags]

Commands:
  evolve <skill>          Run evolution for a skill
  verify <skill>          Run verification for a skill
  verify-all             Verify all skills with evals
  status [--skill <n>]    Show evolution status
  pareto <skill>          Show Pareto frontier
  discover [--skill <n>]  Discover new skills from failures
  cross-test <skill>      Test skill across models
  rollback <skill>        Rollback to previous version
  init-evals <skill>      Generate initial evals for a skill
  help                    Show this help

Flags:
  --rounds N              Max evolution rounds (default: 5)
  --review                Review mode (ask before each step)
  --eval-id N             Run specific eval by ID
  --parallel N            Parallel workers for verify-all (default: 4)
  --models x,y,z          Comma-separated model list for cross-test
  --version <v>           Specific version for rollback

Examples:
  node src/cli.js init-evals abm-ad-creative
  node src/cli.js verify abm-ad-creative
  node src/cli.js evolve abm-ad-creative --rounds 5
  node src/cli.js verify-all --parallel 4
  node src/cli.js cross-test abm-ad-creative --models gpt-4o,claude-sonnet-4
`);
}

main().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
