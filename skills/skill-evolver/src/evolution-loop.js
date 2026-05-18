const { AssertionEngine } = require('./assertion-engine');

class EvolutionLoop {
  constructor(llm, assertionEngine, paretoFrontier, rollbackManager, opts = {}) {
    this.llm = llm;
    this.assertionEngine = assertionEngine;
    this.pareto = paretoFrontier;
    this.rollback = rollbackManager;
    this.maxRounds = parseInt(process.env.EVOLVER_MAX_ROUNDS || '5');
    this._palace = opts.palace || null;
    this._wingId = opts.wingId || null;
  }

  setPalaceStore(palace, wingId) {
    this._palace = palace;
    this._wingId = wingId;
  }

  async _retrieveHallContext(hallType, keywords = []) {
    if (!this._palace || !this._wingId) return [];
    const halls = this._palace.listHalls(this._wingId, hallType);
    const context = [];
    for (const hall of halls.slice(0, 5)) {
      try {
        const data = JSON.parse(hall.data);
        context.push(...(Array.isArray(data) ? data : [data]));
      } catch {
        if (keywords.some(k => hall.data.includes(k))) {
          context.push(hall.data);
        }
      }
    }
    return context;
  }

  async runRound(context) {
    const { round, currentVersion, history, evals, skillName, passThreshold } = context;
    const prevResult = history && history.length > 0 ? history[history.length - 1] : null;

    let candidateContent = currentVersion;

    if (round > 0 && prevResult) {
      const prevScore = prevResult.score || 0;
      const prevPassRate = prevResult.passRate || 0;
      console.log(`  [EvolLoop] Round ${round}: prevScore=${prevScore.toFixed(2)}, prevPassRate=${(prevPassRate * 100).toFixed(0)}%`);

      const failures = await this._retrieveHallContext('hall_failures');
      const suggestions = await this._retrieveHallContext('hall_suggestions');

      const genContext = {
        ...context,
        history: (context.history || []).concat(prevResult ? [prevResult] : []),
        hallFailures: failures,
        hallSuggestions: suggestions
      };

      const improved = await this.assertionEngine.improve(
        candidateContent,
        prevResult,
        genContext
      );

      if (improved && improved !== candidateContent) {
        candidateContent = improved;
        const changed = candidateContent.length - currentVersion.length;
        console.log(`  [EvolLoop] Generated (+${changed > 0 ? '+' : ''}${changed} chars vs original)`);
      } else {
        console.log(`  [EvolLoop] No generation output`);
      }
    }

    await this.rollback.saveCheckpoint(skillName, round, candidateContent);

    const evalResult = await this.assertionEngine.runEvalSuite(candidateContent, evals, context.specialist);

    if (this._palace && this._wingId) {
      if (evalResult.failedAssertions?.length > 0) {
        this._palace.addHall(this._wingId, 'hall_failures', evalResult.failedAssertions, round, {
          passRate: evalResult.passRate,
          score: evalResult.score
        });
      }
    }

    if (prevResult && evalResult.passRate < prevResult.passRate) {
      console.log(`  [EvolLoop] REGRESSION: new=${(evalResult.passRate * 100).toFixed(0)}% < prev=${(prevResult.passRate * 100).toFixed(0)}%. Keeping previous.`);
      return {
        ...evalResult,
        improvedContent: null,
        dominated: false,
        hasRollback: false
      };
    }

    const dominated = this.pareto.checkDominance(evalResult);
    if (dominated) {
      console.log(`  [Pareto] Version dominated by existing candidates`);
      return {
        ...evalResult,
        dominated: true,
        improvedContent: null,
        hasRollback: false
      };
    }

    const dominatesOthers = this.pareto.checkDominatesOthers(evalResult);
    if (dominatesOthers) {
      console.log(`  [Pareto] New version dominates existing candidates!`);
    }

    this.pareto.add(`r${round}-${Date.now()}`, evalResult);

    return {
      ...evalResult,
      improvedContent: candidateContent,
      evaluatedContent: candidateContent,
      hasRollback: !evalResult.passed && round > 0
    };
  }

  async run(cxt) {
    const maxRounds = cxt.maxRounds || this.maxRounds;
    const threshold = cxt.passThreshold || 0.8;
    const results = [];

    for (let r = 0; r < maxRounds; r++) {
      const result = await this.runRound({ ...cxt, round: r, maxRounds, passThreshold: threshold });
      results.push(result);

      if (result.passed && result.passRate >= threshold) {
        console.log(`[EvolutionLoop] Target achieved at round ${r + 1} (${(result.passRate * 100).toFixed(1)}%)`);
        break;
      }

      if (r === maxRounds - 1) {
        console.log(`[EvolutionLoop] Max rounds (${maxRounds}) reached. Best: ${(result.passRate * 100).toFixed(1)}%`);
      }
    }

    return results;
  }
}

module.exports = { EvolutionLoop };
