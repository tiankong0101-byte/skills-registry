const fs = require('fs');
const path = require('path');
const { PalaceStore } = require('./palace-store');

class AutoSaveHook {
  constructor(evolveDir, opts = {}) {
    this.evolveDir = evolveDir;
    this.hookDir = path.join(evolveDir, 'hooks');
    this.enabled = opts.enabled !== false;
    this.autoSaveInterval = opts.interval || 300000;
    this._lastSave = Date.now();
  }

  async saveSnapshot(skillName, wingId, palaceStore, metadata = {}) {
    if (!this.enabled || !palaceStore) return;

    const snapshot = {
      skillName,
      wingId,
      timestamp: new Date().toISOString(),
      metadata,
      palaceStats: palaceStore.stats(),
      bestVersion: palaceStore.getBestVersion(wingId),
      recentHalls: palaceStore.listHalls(wingId).slice(0, 10).map(h => ({
        hall_type: h.hall_type,
        round: h.round,
        created_at: h.created_at
      }))
    };

    const snapshotPath = path.join(this.hookDir, `snapshot_${skillName}_${Date.now()}.json`);
    ensureDir(this.hookDir);
    fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));

    this._cleanupOldSnapshots(skillName, 10);
    this._lastSave = Date.now();
    return snapshotPath;
  }

  async saveAfterEval(skillName, wingId, palaceStore, evalResult) {
    return this.saveSnapshot(skillName, wingId, palaceStore, {
      type: 'eval',
      passRate: evalResult.passRate,
      score: evalResult.score,
      passed: evalResult.passed
    });
  }

  async saveAfterRound(skillName, wingId, palaceStore, roundResult) {
    return this.saveSnapshot(skillName, wingId, palaceStore, {
      type: 'round',
      round: roundResult.round,
      passRate: roundResult.passRate,
      accepted: roundResult.accepted
    });
  }

  _cleanupOldSnapshots(skillName, keepLast = 10) {
    if (!fs.existsSync(this.hookDir)) return;
    const files = fs.readdirSync(this.hookDir)
      .filter(f => f.startsWith(`snapshot_${skillName}_`) && f.endsWith('.json'))
      .map(f => ({ name: f, time: fs.statSync(path.join(this.hookDir, f)).mtimeMs }))
      .sort((a, b) => b.time - a.time);

    for (const f of files.slice(keepLast)) {
      try { fs.unlinkSync(path.join(this.hookDir, f.name)); } catch {}
    }
  }

  getHookScript() {
    return `#!/bin/bash
# MemPalace-style auto-save hook for skill-evolver
# Place this in OpenCode hooks directory

EVOLVE_DIR="${this.evolveDir.replace(/\\/g, '/')}"
SKILL_NAME="$1"
ROUND="$2"

if [ -z "$SKILL_NAME" ]; then
  echo "Usage: $0 <skill-name> [round]"
  exit 1
fi

node "${path.join(__dirname, 'auto-save.js').replace(/\\/g, '/')}" "$SKILL_NAME" "$EVOLVE_DIR" "$ROUND"
`;
  }

  installHook() {
    ensureDir(this.hookDir);
    const hookPath = path.join(this.hookDir, 'evolver_auto_save.sh');
    fs.writeFileSync(hookPath, this.getHookScript(), 'utf-8');
    return hookPath;
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

if (require.main === module) {
  const skillName = process.argv[2];
  const evolveDir = process.argv[3] || __dirname;
  const round = process.argv[4];

  (async () => {
    if (!skillName) {
      console.log('Usage: node auto-save.js <skill-name> [evolve-dir] [round]');
      process.exit(1);
    }
    const store = new PalaceStore(evolveDir);
    await store.init();
    const hook = new AutoSaveHook(evolveDir);
    const wing = store.getWing(skillName);
    if (wing) {
      await hook.saveSnapshot(skillName, wing.id, store, { triggeredBy: 'hook', round });
      console.log(`[AutoSave] Snapshot saved for ${skillName}`);
    }
    store.close();
  })().catch(e => { console.error('[AutoSave] Error:', e.message); process.exit(1); });
}

module.exports = { AutoSaveHook };
