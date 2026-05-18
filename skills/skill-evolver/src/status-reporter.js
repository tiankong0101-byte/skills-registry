const fs = require('fs');
const path = require('path');

class StatusReporter {
  constructor(evolveDir, evalsDir, skillName) {
    this.evolveDir = evolveDir;
    this.evalsDir = evalsDir;
    this.skillName = skillName;
  }

  report() {
    const status = {
      skill: this.skillName,
      timestamp: new Date().toISOString(),
      evals: this.getEvalsStatus(),
      evolution: this.getEvolutionStatus(),
      pareto: this.getParetoStatus(),
      checkpoints: this.getCheckpointStatus()
    };

    this.printReport(status);
    return status;
  }

  getEvalsStatus() {
    const evalPath = path.join(this.evalsDir, this.skillName, 'evals.json');
    if (!fs.existsSync(evalPath)) {
      return { exists: false, count: 0, path: evalPath };
    }

    try {
      const data = JSON.parse(fs.readFileSync(evalPath, 'utf-8'));
      return {
        exists: true,
        count: (data.evals || []).length,
        path: evalPath,
        cases: (data.evals || []).map(e => ({
          id: e.id,
          prompt: e.prompt.substring(0, 60),
          assertionCount: (e.assertions || []).length
        }))
      };
    } catch {
      return { exists: true, count: 0, error: 'Parse error', path: evalPath };
    }
  }

  getEvolutionStatus() {
    const evolvePath = path.join(this.evolveDir, this.skillName, 'evolution-log.json');
    if (!fs.existsSync(evolvePath)) {
      return { evolved: false, rounds: 0, currentPassRate: null };
    }

    try {
      const data = JSON.parse(fs.readFileSync(evolvePath, 'utf-8'));
      return {
        evolved: true,
        rounds: data.history?.length || 0,
        currentPassRate: data.currentPassRate,
        started: data.started,
        completed: data.completed
      };
    } catch {
      return { evolved: true, error: 'Parse error' };
    }
  }

  getParetoStatus() {
    const paretoPath = path.join(this.evolveDir, this.skillName, 'pareto-frontier.json');
    if (!fs.existsSync(paretoPath)) {
      return { exists: false, activeVersions: 0 };
    }

    try {
      const data = JSON.parse(fs.readFileSync(paretoPath, 'utf-8'));
      const active = (data.versions || []).filter(v => !v.dominated);
      return {
        exists: true,
        totalVersions: data.versions?.length || 0,
        activeVersions: active.length,
        bestPassRate: active.length > 0 ? Math.max(...active.map(v => v.passRate)) : null,
        best: active.sort((a, b) => b.passRate - a.passRate)[0] || null
      };
    } catch {
      return { exists: true, error: 'Parse error' };
    }
  }

  getCheckpointStatus() {
    const cpDir = path.join(this.evolveDir, this.skillName, 'checkpoints');
    if (!fs.existsSync(cpDir)) {
      return { count: 0 };
    }

    const files = fs.readdirSync(cpDir).filter(f => f.endsWith('.json') && f !== 'LATEST.json');
    return {
      count: files.length,
      latest: fs.existsSync(path.join(cpDir, 'LATEST.json'))
    };
  }

  printReport(status) {
    console.log('\n══════════════════════════════════════');
    console.log(`  Skill Evolver Status: ${status.skill}`);
    console.log('══════════════════════════════════════');

    console.log('\n[Eval Assertions]');
    if (!status.evals.exists) {
      console.log('  No evals defined. Run with --init-evals to scaffold.');
    } else {
      console.log(`  ${status.evals.count} test cases defined`);
      status.evals.cases?.forEach(c => {
        console.log(`    #${c.id}: "${c.prompt}..." (${c.assertionCount} assertions)`);
      });
    }

    console.log('\n[Evolution]');
    if (!status.evolution.evolved) {
      console.log('  Not yet evolved. Run: node src/index.js evolve <skill>');
    } else {
      console.log(`  ${status.evolution.rounds} rounds completed`);
      console.log(`  Current pass rate: ${status.evolution.currentPassRate?.toFixed(2) || 'N/A'}`);
    }

    console.log('\n[Pareto Frontier]');
    if (!status.pareto.exists) {
      console.log('  No frontier data yet');
    } else {
      console.log(`  ${status.pareto.activeVersions}/${status.pareto.totalVersions} active versions`);
      if (status.pareto.bestPassRate) {
        console.log(`  Best pass rate: ${(status.pareto.bestPassRate * 100).toFixed(1)}%`);
      }
    }

    console.log('\n[Checkpoints]');
    console.log(`  ${status.checkpoints.count} checkpoints saved`);
    console.log(`  Latest: ${status.checkpoints.latest ? 'Yes' : 'No'}`);

    console.log('\n══════════════════════════════════════\n');
  }
}

module.exports = { StatusReporter };
