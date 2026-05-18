const fs = require('fs');
const path = require('path');

const DEFAULT_MODELS = [
  'gpt-4o',
  'claude-sonnet-4-20250514',
  'gemini-2.0-flash',
  'qwen/qwen2.5-coder-7b-instruct'
];

class CrossModelTester {
  constructor(llm) {
    this.llm = llm;
    this.resultsDir = path.join(__dirname, '..', '.evolve', 'cross-model');
  }

  async run(skillName, models = []) {
    const testModels = models.length > 0 ? models : DEFAULT_MODELS;
    console.log(`[CrossModelTester] Testing "${skillName}" across ${testModels.length} models`);

    const evals = this.loadEvals(skillName);
    if (evals.length === 0) {
      console.log('[CrossModelTester] No evals found for this skill');
      return null;
    }

    const skillPath = this.findSkill(skillName);
    if (!skillPath) {
      throw new Error(`Skill "${skillName}" not found`);
    }
    const skillContent = fs.readFileSync(skillPath, 'utf-8');

    const results = {};
    for (const model of testModels) {
      console.log(`  Testing with ${model}...`);
      try {
        const modelResults = await this.testWithModel(skillContent, evals, model);
        results[model] = modelResults;
        console.log(`    ${model}: passRate=${modelResults.passRate.toFixed(2)}, score=${modelResults.score.toFixed(2)}`);
      } catch (e) {
        results[model] = { error: e.message, passRate: 0, score: 0 };
        console.log(`    ${model}: ERROR - ${e.message}`);
      }
    }

    const summary = this.buildSummary(results);
    this.persistResults(skillName, results, summary);
    console.log(`\n[CrossModelTester] Summary:`);
    console.log(JSON.stringify(summary, null, 2));
    return { results, summary };
  }

  async testWithModel(skillContent, evals, model) {
    const { AssertionEngine } = require('./assertion-engine');
    const testLlm = Object.create(this.llm);
    testLlm.model = model;

    const engine = new AssertionEngine(testLlm);
    return engine.runEvalSuite(skillContent, evals);
  }

  buildSummary(results) {
    const modelResults = Object.entries(results)
      .filter(([, r]) => !r.error)
      .map(([model, r]) => ({ model, passRate: r.passRate, score: r.score }));

    const avgPassRate = modelResults.reduce((s, r) => s + r.passRate, 0) / modelResults.length;
    const avgScore = modelResults.reduce((s, r) => s + r.score, 0) / modelResults.length;

    const sorted = [...modelResults].sort((a, b) => b.passRate - a.passRate);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    const variance = modelResults.reduce((s, r) => s + Math.pow(r.passRate - avgPassRate, 2), 0) / modelResults.length;

    return {
      tested: modelResults.length,
      total: Object.keys(results).length,
      avgPassRate,
      avgScore,
      best,
      worst,
      variance,
      stable: variance < 0.1,
      universal: avgPassRate >= 0.7,
      modelSpecific: variance > 0.2,
      recommendation: this.getRecommendation(avgPassRate, variance)
    };
  }

  getRecommendation(avgPassRate, variance) {
    if (avgPassRate >= 0.8 && variance < 0.1) {
      return 'UNIVERSAL: This skill generalizes well across models. Safe to deploy broadly.';
    } else if (variance > 0.2) {
      return 'MODEL-SPECIFIC: This skill depends heavily on model capability. Optimize for weaker models.';
    } else if (avgPassRate < 0.5) {
      return 'WEAK: This skill needs improvement before deployment.';
    } else {
      return 'MODERATE: This skill works for most models but has room for improvement.';
    }
  }

  loadEvals(skillName) {
    const searchPaths = [
      path.join(__dirname, '..', 'evals', skillName, 'evals.json'),
      path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'opencode', 'skills', skillName, 'evals', 'evals.json')
    ];

    for (const p of searchPaths) {
      if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
        return data.evals || [];
      }
    }
    return [];
  }

  findSkill(skillName) {
    const searchPaths = [
      path.join(__dirname, '..', '..', '..', skillName, 'SKILL.md'),
      path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'opencode', 'skills', skillName, 'SKILL.md'),
      path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'workspace', 'skills', skillName, 'SKILL.md')
    ];

    for (const p of searchPaths) {
      if (fs.existsSync(p)) return p;
    }
    return null;
  }

  persistResults(skillName, results, summary) {
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
    const filePath = path.join(this.resultsDir, `${skillName}.json`);
    fs.writeFileSync(filePath, JSON.stringify({ skillName, results, summary, timestamp: new Date().toISOString() }, null, 2));
  }
}

module.exports = { CrossModelTester };
