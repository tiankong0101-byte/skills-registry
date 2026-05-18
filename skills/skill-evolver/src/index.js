const fs = require('fs');
const path = require('path');
const { LLMClient } = require('./llm-client');
const { AssertionEngine } = require('./assertion-engine');
const { EvolutionLoop } = require('./evolution-loop');
const { ParetoFrontier } = require('./pareto-frontier');
const { FailureDiscoverer } = require('./failure-discoverer');
const { SkillBuilder } = require('./skill-builder');
const { CrossModelTester } = require('./cross-model-tester');
const { RollbackManager } = require('./rollback');
const { StatusReporter } = require('./status-reporter');
const { PalaceStore } = require('./palace-store');
const { AutoSaveHook } = require('./auto-save');
const { StrategySelector, createSpecialistAgent } = require('./strategy-selector');

class SkillEvolver {
  constructor(skillName, opts = {}) {
    this.skillName = skillName;
    this.evalsDir = opts.evalsDir || path.join(__dirname, '..', 'evals');
    this.memoryDir = opts.memoryDir || path.join(__dirname, '..', 'memory');
    this.evolveDir = opts.evolveDir || path.join(__dirname, '..', '.evolve');
    this.maxRounds = parseInt(process.env.EVOLVER_MAX_ROUNDS || '5');
    this.passThreshold = parseFloat(process.env.EVOLVER_PASS_THRESHOLD || '0.8');
    this.reviewMode = process.env.EVOLVER_REVIEW_MODE === 'true';
    this._palaceStore = opts.palaceStore || null;
    this._wingId = null;
    this._autoSave = new AutoSaveHook(this.evolveDir);
    this._strategySelector = new StrategySelector();

    this.llm = new LLMClient(opts);
    this.assertionEngine = new AssertionEngine(this.llm);
    this.paretoFrontier = new ParetoFrontier(this.evolveDir, skillName);
    this.rollback = new RollbackManager(this.evolveDir, skillName, {
      mode: process.env.EVOLVER_ROLLBACK_MODE || 'hard'
    });
    this.evolutionLoop = new EvolutionLoop(this.llm, this.assertionEngine, this.paretoFrontier, this.rollback, opts);
    this.failureDiscoverer = new FailureDiscoverer(this.llm, this.memoryDir);
    this.skillBuilder = new SkillBuilder(this.llm);
    this.crossModelTester = new CrossModelTester(this.llm);
    this.statusReporter = new StatusReporter(this.evolveDir, this.evalsDir, skillName);

    ensureDir(this.evalsDir);
    ensureDir(this.memoryDir);
    ensureDir(this.evolveDir);
  }

  async _initPalace() {
    if (!this._palaceStore) {
      this._palaceStore = new PalaceStore(this.evolveDir);
      await this._palaceStore.init();
    }
    const wing = this._palaceStore.upsertWing(this.skillName, 'skill', {});
    this._wingId = wing.id;
    this.paretoFrontier.setPalaceStore(this._palaceStore, wing.id);
    this.rollback.setPalaceStore(this._palaceStore, wing.id);
    this.evolutionLoop.setPalaceStore(this._palaceStore, wing.id);
  }

  async _closePalace() {
    if (this._palaceStore) {
      this._palaceStore.close();
    }
  }

  async evolve(rounds) {
    const specialist = createSpecialistAgent(this.skillName, this.llm, this.assertionEngine);
    rounds = rounds || specialist.recommendedRounds;
    const threshold = specialist.passThreshold;
    console.log(`[Evolver] Starting evolution for "${this.skillName}" (${rounds} rounds, threshold: ${threshold})`);
    console.log(`[Evolver] Strategy: ${specialist.describe()}`);
    await this._initPalace();
    try {
      const skillPath = this.findSkillPath();
      if (!skillPath) throw new Error(`Skill "${this.skillName}" not found`);
      const skillContent = fs.readFileSync(skillPath, 'utf-8');
      const evals = this.loadEvals();
      const memory = this.loadMemory();
      const history = [];
      let currentContent = skillContent;

      for (let round = 0; round < rounds; round++) {
        console.log(`\n[Evolver] === Round ${round + 1}/${rounds} ===`);
        const context = {
          round, maxRounds: rounds, skillName: this.skillName,
          currentVersion: currentContent, originalVersion: skillContent,
          history: history.map(h => h.result),
          memory, evals, passThreshold: threshold,
          palace: this._palaceStore, wingId: this._wingId,
          specialist
        };

        const result = await this.evolutionLoop.runRound(context);
        console.log(`[Evolver] Round ${round + 1}: ${result.passed ? 'PASSED' : 'FAILED'} (${(result.passRate * 100).toFixed(1)}%)`);
        history.push({ round, result, accepted: result.passed });

        if (result.passed && result.passRate >= threshold) {
          console.log(`[Evolver] Threshold reached. Stopping.`);
          break;
        }

        if (result.improvedContent) {
          currentContent = result.improvedContent;
          console.log(`[Evolver] Content updated (+${result.improvedContent.length - skillContent.length} chars from original)`);
        }

        if (this._wingId) {
          await this._autoSave.saveAfterRound(this.skillName, this._wingId, this._palaceStore, {
            round, passRate: result.passRate, accepted: result.passed
          });
        }

        if (result.hasRollback) {
          const rolled = await this.rollback.perform({ content: currentContent });
          if (rolled) { currentContent = rolled.content; console.log('[Evolver] Rolled back'); }
        }

        if (this.reviewMode) {
          const confirmed = await this.askUser(`Accept? (y/n) `);
          if (!confirmed) continue;
        }
      }

      const summary = this.buildSummary(history, { content: currentContent });
      console.log('\n[Evolver] Evolution complete');
      console.log(JSON.stringify(summary, null, 2));
      return summary;
    } finally {
      await this._closePalace();
    }
  }

  async verify(evalId = null) {
    console.log(`[Evolver] Verifying "${this.skillName}"`);
    await this._initPalace();
    try {
      const skillPath = this.findSkillPath();
      if (!skillPath) throw new Error(`Skill "${this.skillName}" not found`);

      const skillContent = fs.readFileSync(skillPath, 'utf-8');
      const evals = this.loadEvals();
      const targetEvals = evalId != null ? evals.filter(e => e.id == evalId) : evals;

      const results = [];
      for (const evalCase of targetEvals) {
        console.log(`  Running eval #${evalCase.id}: "${evalCase.prompt.substring(0, 50)}..."`);
        const specialist = createSpecialistAgent(this.skillName, this.llm, this.assertionEngine);
        const result = await this.assertionEngine.verify(skillContent, evalCase, specialist);
        results.push({ evalId: evalCase.id, ...result });
        console.log(`    Result: ${result.passed ? 'PASS' : 'FAIL'} (${result.score})`);
      }

      if (this._wingId) {
        await this._autoSave.saveAfterEval(this.skillName, this._wingId, this._palaceStore, {
          passRate: results.filter(r => r.passed).length / results.length,
          score: results.reduce((s, r) => s + r.score, 0) / results.length,
          passed: results.some(r => r.passed)
        });
      }

      const passRate = results.filter(r => r.passed).length / results.length;
      console.log(`\n[Verifer] Overall: ${passRate} (${results.filter(r=>r.passed).length}/${results.length})`);
      return { passRate, results };
    } finally {
      await this._closePalace();
    }
  }

  async verifyAll(parallel = 4) {
    const evalsFiles = globSync(path.join(this.evalsDir, '**', 'evals.json').replace(/\\/g, '/'));
    console.log(`[Verifer] Found ${evalsFiles.length} skills with evals`);

    const batches = chunk(evalsFiles, parallel);
    const allResults = {};
    const sharedLlm = this.llm;
    const sharedEngine = this.assertionEngine;

    for (const batch of batches) {
      const batchResults = await Promise.all(batch.map(async (file) => {
        const skillName = path.basename(path.dirname(file));
        try {
          const skillEvolver = new SkillEvolver(skillName, {
            evalsDir: this.evalsDir,
            evolveDir: this.evolveDir
          });
          const r = await skillEvolver.verify();
          return { skillName, ...r };
        } catch (e) {
          return { skillName, error: e.message };
        }
      }));
      batchResults.forEach(r => { allResults[r.skillName] = r; });
    }

    const passCount = Object.values(allResults).filter(r => r.passRate >= 0.8).length;
    console.log(`\n[Verifer] Summary: ${passCount}/${Object.keys(allResults).length} skills passed`);
    return allResults;
  }

  async status() {
    return this.statusReporter.report();
  }

  async pareto() {
    return this.paretoFrontier.report();
  }

  async discover(fromFailures = true, skillName = null) {
    console.log('[Discoverer] Starting failure-driven skill discovery');
    const memory = this.loadMemory();

    if (fromFailures) {
      const failures = this.failureDiscoverer.extractFailures(memory);
      if (failures.length === 0) {
        console.log('[Discoverer] No failures found in memory');
        return null;
      }

      console.log(`[Discoverer] Found ${failures.length} failure records`);
      const patterns = await this.failureDiscoverer.analyzePatterns(failures);
      console.log(`[Discoverer] Identified ${patterns.length} failure patterns`);

      for (const pattern of patterns) {
        const proposal = await this.failureDiscoverer.propose(pattern);
        console.log(`[Discoverer] Proposal: ${proposal.name} - ${proposal.description}`);

        if (this.reviewMode) {
          const confirmed = await this.askUser(`Create skill "${proposal.name}"? (y/n)`);
          if (!confirmed) continue;
        }

        const skillContent = await this.skillBuilder.build(proposal);
        const outputPath = path.join(this.evalsDir, '..', proposal.name, 'SKILL.md');
        ensureDir(path.dirname(outputPath));
        fs.writeFileSync(outputPath, skillContent);
        console.log(`[Discoverer] Created: ${outputPath}`);
      }
    }
  }

  async crossTest(models = []) {
    return this.crossModelTester.run(this.skillName, models);
  }

  async rollback(version = null) {
    return this.rollback.rollbackTo(version);
  }

  findSkillPath() {
    const searchDirs = [
      path.join(__dirname, '..', '..', '..'),
      path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'opencode', 'skills'),
      path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'workspace', 'skills'),
    ];

    for (const dir of searchDirs) {
      if (!fs.existsSync(dir)) continue;
      const possiblePaths = [
        path.join(dir, this.skillName, 'SKILL.md'),
        path.join(dir, `${this.skillName}.md`),
        path.join(dir, this.skillName, 'skill.md'),
      ];
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) return p;
      }
    }
    return null;
  }

  loadEvals() {
    const evalPath = path.join(this.evalsDir, this.skillName, 'evals.json');
    if (fs.existsSync(evalPath)) {
      const data = JSON.parse(fs.readFileSync(evalPath, 'utf-8'));
      return data.evals || [];
    }

    const genericPath = path.join(this.evalsDir, 'evals.json');
    if (fs.existsSync(genericPath)) {
      const data = JSON.parse(fs.readFileSync(genericPath, 'utf-8'));
      return (data.evals || []).filter(e => !e.skill_name || e.skill_name === this.skillName);
    }

    return [];
  }

  loadMemory() {
    const memPath = path.join(this.memoryDir, `${this.skillName}-memory.json`);
    if (fs.existsSync(memPath)) {
      return JSON.parse(fs.readFileSync(memPath, 'utf-8'));
    }
    return { history: [], feedback: [], rounds: 0, pareto: [] };
  }

  saveMemory(memory) {
    const memPath = path.join(this.memoryDir, `${this.skillName}-memory.json`);
    ensureDir(this.memoryDir);
    fs.writeFileSync(memPath, JSON.stringify(memory, null, 2));
  }

  extractMetadata(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};
    const yaml = {};
    match[1].split('\n').forEach(line => {
      const [k, ...v] = line.split(':');
      if (k && v.length) yaml[k.trim()] = v.join(':').trim();
    });
    return yaml;
  }

  buildSummary(history, currentVersion) {
    const passed = history.filter(h => h.accepted);
    return {
      skillName: this.skillName,
      totalRounds: history.length,
      passedRounds: passed.length,
      finalPassRate: passed.length > 0 ? passed[passed.length - 1].result.passRate : 0,
      threshold: this.passThreshold,
      history: history.map(h => ({
        round: h.round + 1,
        passRate: h.result.passRate,
        accepted: h.accepted,
        failures: h.result.failedAssertions || []
      })),
      paretoSize: this.paretoFrontier.size()
    };
  }

  askUser(question) {
    return new Promise((resolve) => {
      const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question(question + ' ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase().startsWith('y'));
      });
    });
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function globSync(pattern) {
  const { globSync } = require('glob');
  return globSync(pattern.replace(/\\/g, '/'));
}

function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

module.exports = { SkillEvolver };
