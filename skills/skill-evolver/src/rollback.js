const fs = require('fs');
const path = require('path');

class RollbackManager {
  constructor(evolveDir, skillName, opts = {}, palaceStore = null) {
    this.dir = path.join(evolveDir, skillName);
    this.skillName = skillName;
    this.mode = opts.mode || 'hard';
    this.checkpointsDir = path.join(this.dir, 'checkpoints');
    this._palace = palaceStore;
    this._wingId = null;
    if (this._palace) {
      const wing = this._palace.getWing(skillName);
      if (wing) this._wingId = wing.id;
    }
  }

  setPalaceStore(palace, wingId) {
    this._palace = palace;
    this._wingId = wingId;
  }

  async perform(currentVersion) {
    if (this.mode === 'none') return null;
    const latest = this.getLatestCheckpoint();
    if (!latest) return null;
    if (this.mode === 'hard') return latest;
    if (this.mode === 'stash') {
      this.saveCheckpoint(this.skillName, 999, currentVersion.content);
      return latest;
    }
    return latest;
  }

  saveCheckpoint(skillName, round, content) {
    if (this._palace && this._wingId) {
      this._palace.addCheckpoint(this._wingId, round, content);
      return;
    }
    if (!fs.existsSync(this.checkpointsDir)) {
      fs.mkdirSync(this.checkpointsDir, { recursive: true });
    }
    const checkpoint = { skillName, round, content, timestamp: new Date().toISOString() };
    const filePath = path.join(this.checkpointsDir, `round-${String(round).padStart(3, '0')}.json`);
    fs.writeFileSync(filePath, JSON.stringify(checkpoint, null, 2));
    fs.writeFileSync(path.join(this.checkpointsDir, 'LATEST.json'), JSON.stringify(checkpoint, null, 2));
  }

  getLatestCheckpoint() {
    if (this._palace && this._wingId) {
      return this._palace.getCheckpoint(this._wingId);
    }
    const latestPath = path.join(this.checkpointsDir, 'LATEST.json');
    if (!fs.existsSync(latestPath)) {
      const files = fs.readdirSync(this.checkpointsDir).filter(f => f.endsWith('.json') && f !== 'LATEST.json');
      if (files.length === 0) return null;
      files.sort();
      return JSON.parse(fs.readFileSync(path.join(this.checkpointsDir, files[files.length - 1]), 'utf-8'));
    }
    return JSON.parse(fs.readFileSync(latestPath, 'utf-8'));
  }

  async rollbackTo(version) {
    if (!version) {
      const latest = this.getLatestCheckpoint();
      if (!latest) { console.log('[Rollback] No checkpoints found'); return null; }
      return latest;
    }
    if (this._palace && this._wingId) {
      return this._palace.getCheckpoint(this._wingId, parseInt(version));
    }
    const checkpointPath = path.join(this.checkpointsDir, `round-${String(version).padStart(3, '0')}.json`);
    if (!fs.existsSync(checkpointPath)) { console.log(`[Rollback] Checkpoint not found`); return null; }
    return JSON.parse(fs.readFileSync(checkpointPath, 'utf-8'));
  }

  listCheckpoints() {
    if (this._palace && this._wingId) {
      return this._palace.listCheckpoints(this._wingId).map(cp => ({ round: cp.round, timestamp: cp.created_at }));
    }
    if (!fs.existsSync(this.checkpointsDir)) return [];
    return fs.readdirSync(this.checkpointsDir)
      .filter(f => f.endsWith('.json') && f !== 'LATEST.json')
      .map(f => {
        const data = JSON.parse(fs.readFileSync(path.join(this.checkpointsDir, f), 'utf-8'));
        return { file: f, round: data.round, timestamp: data.timestamp };
      })
      .sort((a, b) => a.round - b.round);
  }

  prune(keepLast = 5) {
    const checkpoints = this.listCheckpoints();
    const toRemove = checkpoints.slice(0, -keepLast);
    for (const cp of toRemove) {
      const filePath = path.join(this.checkpointsDir, cp.file);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    console.log(`[Rollback] Pruned ${toRemove.length} old checkpoints`);
  }
}

module.exports = { RollbackManager };
