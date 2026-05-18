const { PalaceStore } = require('./palace-store');

class ParetoFrontier {
  constructor(evolveDir, skillName, palaceStore = null) {
    this.evolveDir = evolveDir;
    this.skillName = skillName;
    this._palace = palaceStore;
    this._wingId = null;
    this._loadWing();
  }

  _loadWing() {
    if (this._palace) {
      const wing = this._palace.getWing(this.skillName);
      if (wing) this._wingId = wing.id;
    }
  }

  setPalaceStore(palace) {
    this._palace = palace;
    this._loadWing();
  }

  load() {
    if (this._palace && this._wingId) {
      const versions = this._palace.listAllVersions(this._wingId);
      return {
        versions: versions.map(v => ({
          id: v.version_id,
          timestamp: v.created_at,
          passRate: v.pass_rate,
          score: v.score,
          assertionCount: 0,
          dominated: !!v.dominated
        })),
        skills: {}
      };
    }
    const fs = require('fs');
    const path = require('path');
    const frontierPath = path.join(this.evolveDir, this.skillName, 'pareto-frontier.json');
    if (fs.existsSync(frontierPath)) {
      try {
        return JSON.parse(fs.readFileSync(frontierPath, 'utf-8'));
      } catch {
        return { versions: [], skills: {} };
      }
    }
    return { versions: [], skills: {} };
  }

  persist(frontier = null) {
    if (this._palace && this._wingId) return;
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(this.evolveDir, this.skillName);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const data = frontier || this.load();
    fs.writeFileSync(path.join(dir, 'pareto-frontier.json'), JSON.stringify(data, null, 2));
  }

  add(version, evalResult) {
    if (this._palace && this._wingId) {
      const dominated = this.checkDominance(evalResult);
      const entry = this._palace.paretoAddVersion(
        this._wingId,
        version,
        evalResult.passRate,
        evalResult.score,
        evalResult.evaluatedContent || null,
        { assertionCount: evalResult.results?.length || 0 }
      );
      if (entry.dominated) {
        console.log(`  [Pareto] Version dominated by existing candidates`);
      } else {
        console.log(`  [Pareto] New version dominates existing candidates! Added to frontier (passRate: ${evalResult.passRate})`);
      }
      return entry;
    }

    const { versions, skills } = this.load();
    const entry = {
      id: version,
      timestamp: new Date().toISOString(),
      passRate: evalResult.passRate,
      score: evalResult.score,
      assertionCount: evalResult.results?.length || 0,
      dominated: false
    };

    const dominated = versions.map(v => {
      if (this.dominates(entry, v) && !this.dominates(v, entry)) {
        return { ...v, dominated: true };
      }
      return v;
    });

    if (!dominated.some(v => this.dominates(v, entry) && !this.dominates(entry, v))) {
      entry.dominated = false;
      dominated.push(entry);
      console.log(`  [Pareto] Added version ${entry.id} to frontier (passRate: ${entry.passRate})`);
    }

    const key = `v${dominated.length}`;
    skills[key] = { passRate: entry.passRate, dominated: entry.dominated };
    this.persist({ versions: dominated, skills });
    return entry;
  }

  dominates(a, b) {
    return a.passRate >= b.passRate &&
           a.score >= b.score &&
           (a.passRate > b.passRate || a.score > b.score);
  }

  checkDominance(evalResult) {
    if (this._palace && this._wingId) {
      const active = this._palace.listActiveVersions(this._wingId);
      return active.some(v => this.dominates({ passRate: v.pass_rate, score: v.score }, evalResult));
    }
    const { versions } = this.load();
    return versions.some(v => !v.dominated && this.dominates(v, evalResult));
  }

  checkDominatesOthers(evalResult) {
    if (this._palace && this._wingId) {
      const active = this._palace.listActiveVersions(this._wingId);
      return active.every(v => this.dominates(evalResult, { passRate: v.pass_rate, score: v.score }));
    }
    const { versions } = this.load();
    return versions.filter(v => !v.dominated).every(v => this.dominates(evalResult, v));
  }

  getBest() {
    if (this._palace && this._wingId) {
      const best = this._palace.getBestVersion(this._wingId);
      if (!best) return null;
      return {
        id: best.version_id,
        passRate: best.pass_rate,
        score: best.score
      };
    }
    const { versions } = this.load();
    return versions.filter(v => !v.dominated).sort((a, b) => b.passRate - a.passRate)[0] || null;
  }

  size() {
    if (this._palace && this._wingId) {
      return this._palace.listActiveVersions(this._wingId).length;
    }
    const { versions } = this.load();
    return versions.filter(v => !v.dominated).length;
  }

  report() {
    if (this._palace && this._wingId) {
      return this._palace.paretoReport(this._wingId);
    }
    const { versions } = this.load();
    const best = this.getBest();
    const active = versions.filter(v => !v.dominated);
    const dominated = versions.filter(v => v.dominated);
    return {
      total: versions.length,
      active: active.length,
      dominated: dominated.length,
      best: best ? { passRate: best.passRate, score: best.score, id: best.id } : null,
      history: versions.map(v => ({
        id: v.id,
        passRate: v.passRate,
        score: v.score,
        dominated: v.dominated,
        timestamp: v.timestamp
      }))
    };
  }

  selectForTask(taskType) {
    const active = this._palace && this._wingId
      ? this._palace.listActiveVersions(this._wingId)
      : this.load().versions.filter(v => !v.dominated);
    if (active.length === 0) return null;
    return active[Math.floor(Math.random() * active.length)];
  }
}

module.exports = { ParetoFrontier };
