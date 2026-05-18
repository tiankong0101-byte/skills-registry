const fs = require('fs');
const path = require('path');

const INIT_SQL = `
CREATE TABLE IF NOT EXISTS wings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'skill',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  meta TEXT DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wing_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  hall TEXT NOT NULL DEFAULT 'hall_general',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  meta TEXT DEFAULT '{}',
  UNIQUE(wing_id, name, hall)
);

CREATE TABLE IF NOT EXISTS drawers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  version_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  meta TEXT DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS halls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wing_id INTEGER NOT NULL,
  hall_type TEXT NOT NULL,
  data TEXT NOT NULL,
  round INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  meta TEXT DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS tunnels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wing_a_id INTEGER NOT NULL,
  wing_b_id INTEGER NOT NULL,
  room_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wing_id INTEGER NOT NULL,
  version_id TEXT NOT NULL,
  pass_rate REAL NOT NULL DEFAULT 0,
  score REAL NOT NULL DEFAULT 0,
  dominated INTEGER NOT NULL DEFAULT 0,
  dominated_by_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  meta TEXT DEFAULT '{}',
  UNIQUE(wing_id, version_id)
);

CREATE TABLE IF NOT EXISTS checkpoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wing_id INTEGER NOT NULL,
  round INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(wing_id, round)
);

CREATE INDEX IF NOT EXISTS idx_halls_wing ON halls(wing_id, hall_type);
CREATE INDEX IF NOT EXISTS idx_halls_type ON halls(hall_type);
CREATE INDEX IF NOT EXISTS idx_rooms_wing ON rooms(wing_id);
CREATE INDEX IF NOT EXISTS idx_versions_wing ON versions(wing_id);
CREATE INDEX IF NOT EXISTS idx_versions_dominated ON versions(dominated);
CREATE INDEX IF NOT EXISTS idx_drawers_room ON drawers(room_id);
`;

class PalaceStore {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.dbPath = path.join(baseDir, 'palace.db');
    this.drawerDir = path.join(baseDir, 'drawers');
    this.db = null;
    this.SQL = null;
  }

  async init() {
    ensureDir(this.baseDir);
    ensureDir(this.drawerDir);
    const initSqlJs = require('sql.js');
    this.SQL = await initSqlJs();
    if (fs.existsSync(this.dbPath)) {
      const buf = fs.readFileSync(this.dbPath);
      this.db = new this.SQL.Database(buf);
    } else {
      this.db = new this.SQL.Database();
    }
    this.db.run(INIT_SQL);
    this._persist();
    return this;
  }

  _persist() {
    const data = this.db.export();
    const buf = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buf);
  }

  _toRows(result) {
    if (!result || result.length === 0) return [];
    const [{ columns, values }] = result;
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });
  }

  close() {
    if (this.db) {
      this._persist();
      this.db.close();
    }
  }

  upsertWing(name, type = 'skill', meta = {}) {
    const existing = this.db.exec(`SELECT id FROM wings WHERE name = '${name.replace(/'/g, "''")}'`);
    if (existing.length > 0 && existing[0].values.length > 0) {
      const id = existing[0].values[0][0];
      this.db.run(`UPDATE wings SET meta = '${JSON.stringify(meta).replace(/'/g, "''")}' WHERE id = ${id}`);
      this._persist();
      return this.getWing(name);
    }
    this.db.run(`INSERT INTO wings (name, type, meta) VALUES ('${name.replace(/'/g, "''")}', '${type}', '${JSON.stringify(meta).replace(/'/g, "''")}')`);
    this._persist();
    const row = this.db.exec(`SELECT * FROM wings WHERE name = '${name.replace(/'/g, "''")}'`);
    return this._toRows(row)[0];
  }

  getWing(name) {
    const row = this.db.exec(`SELECT * FROM wings WHERE name = '${name.replace(/'/g, "''")}'`);
    return this._toRows(row)[0] || null;
  }

  listWings() {
    const row = this.db.exec('SELECT * FROM wings ORDER BY created_at DESC');
    return this._toRows(row);
  }

  upsertRoom(wingId, name, hall = 'hall_general', meta = {}) {
    const existing = this.db.exec(`SELECT id FROM rooms WHERE wing_id = ${wingId} AND name = '${name.replace(/'/g, "''")}' AND hall = '${hall.replace(/'/g, "''")}'`);
    if (existing.length > 0 && existing[0].values.length > 0) {
      return this._toRows(existing)[0];
    }
    this.db.run(`INSERT INTO rooms (wing_id, name, hall, meta) VALUES (${wingId}, '${name.replace(/'/g, "''")}', '${hall.replace(/'/g, "''")}', '${JSON.stringify(meta).replace(/'/g, "''")}')`);
    this._persist();
    const row = this.db.exec(`SELECT * FROM rooms WHERE wing_id = ${wingId} AND name = '${name.replace(/'/g, "''")}' AND hall = '${hall.replace(/'/g, "''")}'`);
    return this._toRows(row)[0];
  }

  listRooms(wingId, hall = null) {
    let sql = `SELECT * FROM rooms WHERE wing_id = ${wingId}`;
    if (hall) sql += ` AND hall = '${hall.replace(/'/g, "''")}'`;
    sql += ' ORDER BY created_at';
    const row = this.db.exec(sql);
    return this._toRows(row);
  }

  addDrawer(roomId, content, versionId, meta = {}) {
    ensureDir(path.join(this.drawerDir, `room_${roomId}`));
    const drawerPath = path.join(this.drawerDir, `room_${roomId}`, `${versionId}.md`);
    fs.writeFileSync(drawerPath, content, 'utf-8');

    this.db.run(`INSERT INTO drawers (room_id, content, version_id, meta) VALUES (${roomId}, '${escape(content)}', '${versionId.replace(/'/g, "''")}', '${JSON.stringify(meta).replace(/'/g, "''")}')`);
    this._persist();
    const row = this.db.exec('SELECT last_insert_rowid() as id');
    return { id: this._toRows(row)[0]?.id, path: drawerPath };
  }

  getDrawer(roomId, versionId = null) {
    let sql = `SELECT * FROM drawers WHERE room_id = ${roomId}`;
    if (versionId) sql += ` AND version_id = '${versionId.replace(/'/g, "''")}'`;
    sql += ' ORDER BY created_at DESC LIMIT 1';
    const row = this.db.exec(sql);
    const d = this._toRows(row)[0] || null;
    if (d) {
      const drawerPath = path.join(this.drawerDir, `room_${roomId}`, `${d.version_id}.md`);
      if (fs.existsSync(drawerPath)) {
        d.fileContent = fs.readFileSync(drawerPath, 'utf-8');
      }
    }
    return d;
  }

  listDrawers(roomId) {
    const row = this.db.exec(`SELECT id, version_id, created_at, meta FROM drawers WHERE room_id = ${roomId} ORDER BY created_at DESC`);
    return this._toRows(row);
  }

  addVersion(wingId, versionId, passRate, score, dominated = false, dominatedById = null, meta = {}) {
    const existing = this.db.exec(`SELECT id FROM versions WHERE wing_id = ${wingId} AND version_id = '${versionId.replace(/'/g, "''")}'`);
    if (existing.length > 0 && existing[0].values.length > 0) {
      this.db.run(`UPDATE versions SET pass_rate = ${passRate}, score = ${score}, dominated = ${dominated ? 1 : 0}, dominated_by_id = ${dominatedById}, meta = '${JSON.stringify(meta).replace(/'/g, "''")}' WHERE wing_id = ${wingId} AND version_id = '${versionId.replace(/'/g, "''")}'`);
      this._persist();
    } else {
      this.db.run(`INSERT INTO versions (wing_id, version_id, pass_rate, score, dominated, dominated_by_id, meta) VALUES (${wingId}, '${versionId.replace(/'/g, "''")}', ${passRate}, ${score}, ${dominated ? 1 : 0}, ${dominatedById}, '${JSON.stringify(meta).replace(/'/g, "''")}')`);
      this._persist();
    }
    const row = this.db.exec(`SELECT * FROM versions WHERE wing_id = ${wingId} AND version_id = '${versionId.replace(/'/g, "''")}'`);
    return this._toRows(row)[0];
  }

  getBestVersion(wingId) {
    const row = this.db.exec(`SELECT * FROM versions WHERE wing_id = ${wingId} AND dominated = 0 ORDER BY pass_rate DESC, score DESC LIMIT 1`);
    return this._toRows(row)[0] || null;
  }

  listActiveVersions(wingId) {
    const row = this.db.exec(`SELECT * FROM versions WHERE wing_id = ${wingId} AND dominated = 0 ORDER BY pass_rate DESC`);
    return this._toRows(row);
  }

  listAllVersions(wingId) {
    const row = this.db.exec(`SELECT * FROM versions WHERE wing_id = ${wingId} ORDER BY created_at DESC`);
    return this._toRows(row);
  }

  addHall(wingId, hallType, data, round = 0, meta = {}) {
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    this.db.run(`INSERT INTO halls (wing_id, hall_type, data, round, meta) VALUES (${wingId}, '${hallType.replace(/'/g, "''")}', '${escape(dataStr)}', ${round}, '${JSON.stringify(meta).replace(/'/g, "''")}')`);
    this._persist();
    const row = this.db.exec('SELECT last_insert_rowid() as id');
    return { id: this._toRows(row)[0]?.id };
  }

  listHalls(wingId, hallType = null) {
    let sql = `SELECT * FROM halls WHERE wing_id = ${wingId}`;
    if (hallType) sql += ` AND hall_type = '${hallType.replace(/'/g, "''")}'`;
    sql += ' ORDER BY created_at DESC';
    const row = this.db.exec(sql);
    return this._toRows(row);
  }

  searchHalls(wingId, hallType, query) {
    const q = query.replace(/'/g, "''");
    const row = this.db.exec(`SELECT * FROM halls WHERE wing_id = ${wingId} AND hall_type = '${hallType.replace(/'/g, "''")}' AND data LIKE '%${q}%' ORDER BY created_at DESC LIMIT 20`);
    return this._toRows(row);
  }

  getLatestHall(wingId, hallType) {
    const row = this.db.exec(`SELECT * FROM halls WHERE wing_id = ${wingId} AND hall_type = '${hallType.replace(/'/g, "''")}' ORDER BY created_at DESC LIMIT 1`);
    return this._toRows(row)[0] || null;
  }

  addCheckpoint(wingId, round, content) {
    ensureDir(path.join(this.baseDir, 'checkpoints', `wing_${wingId}`));
    const cpPath = path.join(this.baseDir, 'checkpoints', `wing_${wingId}`, `round-${String(round).padStart(3, '0')}.md`);
    fs.writeFileSync(cpPath, content, 'utf-8');

    const existing = this.db.exec(`SELECT id FROM checkpoints WHERE wing_id = ${wingId} AND round = ${round}`);
    if (existing.length > 0 && existing[0].values.length > 0) {
      this.db.run(`UPDATE checkpoints SET content = '${escape(content)}' WHERE wing_id = ${wingId} AND round = ${round}`);
    } else {
      this.db.run(`INSERT INTO checkpoints (wing_id, round, content) VALUES (${wingId}, ${round}, '${escape(content)}')`);
    }
    this._persist();
    return { path: cpPath };
  }

  getCheckpoint(wingId, round = null) {
    let sql = `SELECT * FROM checkpoints WHERE wing_id = ${wingId}`;
    if (round !== null) sql += ` AND round = ${round}`;
    else sql += ' ORDER BY round DESC LIMIT 1';
    const row = this.db.exec(sql);
    return this._toRows(row)[0] || null;
  }

  listCheckpoints(wingId) {
    const row = this.db.exec(`SELECT * FROM checkpoints WHERE wing_id = ${wingId} ORDER BY round ASC`);
    return this._toRows(row);
  }

  addTunnel(wingAId, wingBId, roomName) {
    const a = Math.min(wingAId, wingBId), b = Math.max(wingAId, wingBId);
    const existing = this.db.exec(`SELECT id FROM tunnels WHERE wing_a_id = ${a} AND wing_b_id = ${b} AND room_name = '${roomName.replace(/'/g, "''")}'`);
    if (existing.length > 0 && existing[0].values.length > 0) return { id: existing[0].values[0][0] };
    this.db.run(`INSERT INTO tunnels (wing_a_id, wing_b_id, room_name) VALUES (${a}, ${b}, '${roomName.replace(/'/g, "''")}')`);
    this._persist();
    const row = this.db.exec('SELECT last_insert_rowid() as id');
    return { id: this._toRows(row)[0]?.id };
  }

  findTunnels(roomName) {
    const row = this.db.exec(`SELECT * FROM tunnels WHERE room_name = '${roomName.replace(/'/g, "''")}'`);
    return this._toRows(row);
  }

  stats() {
    const c = n => { const r = this.db.exec(`SELECT COUNT(*) as c FROM ${n}`); return this._toRows(r)[0]?.c || 0; };
    return {
      wings: c('wings'),
      rooms: c('rooms'),
      drawers: c('drawers'),
      halls: c('halls'),
      versions: c('versions'),
      activeVersions: this._toRows(this.db.exec(`SELECT COUNT(*) as c FROM versions WHERE dominated = 0`))[0]?.c || 0
    };
  }

  migrateFromJSON(evolveDir) {
    if (!fs.existsSync(evolveDir)) return;
    const skillDirs = fs.readdirSync(evolveDir).filter(f => {
      const p = path.join(evolveDir, f);
      try {
        return fs.statSync(p).isDirectory() && f !== 'drawers' && f !== 'checkpoints' && f !== 'palace.db';
      } catch { return false; }
    });

    for (const skill of skillDirs) {
      const skillDir = path.join(evolveDir, skill);
      const wing = this.upsertWing(skill, 'skill', { migrated: true });

      const paretoPath = path.join(skillDir, 'pareto-frontier.json');
      if (fs.existsSync(paretoPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(paretoPath, 'utf-8'));
          for (const v of data.versions || []) {
            this.addVersion(wing.id, String(v.id), v.passRate, v.score, v.dominated, null, { original: v });
          }
        } catch (e) {
          console.log(`  [Palace] Failed to migrate pareto for ${skill}: ${e.message}`);
        }
      }

      const memoryPath = path.join(evolveDir, '..', 'memory', `${skill}-memory.json`);
      if (fs.existsSync(memoryPath)) {
        try {
          const mem = JSON.parse(fs.readFileSync(memoryPath, 'utf-8'));
          for (const h of mem.history || []) {
            const room = this.upsertRoom(wing.id, `v${h.round}`, 'hall_evals');
            this.addDrawer(room.id, h.result?.evaluatedContent || '', `r${h.round}`, {
              result: h.result,
              accepted: h.accepted
            });
            if (h.result?.failedAssertions) {
              this.addHall(wing.id, 'hall_failures', h.result.failedAssertions, h.round);
            }
          }
        } catch (e) {
          console.log(`  [Palace] Failed to migrate memory for ${skill}: ${e.message}`);
        }
      }

      const cpDir = path.join(skillDir, 'checkpoints');
      if (fs.existsSync(cpDir)) {
        const cps = fs.readdirSync(cpDir);
        for (const cp of cps) {
          if (cp.endsWith('.json')) {
            try {
              const cpData = JSON.parse(fs.readFileSync(path.join(cpDir, cp), 'utf-8'));
              const round = cp.match(/round-(\d+)/)?.[1] || 0;
              this.addCheckpoint(wing.id, parseInt(round), cpData.content || '');
            } catch (e) {}
          }
        }
      }
    }
  }

  dominates(a, b) {
    return a.passRate >= b.passRate && a.score >= b.score &&
      (a.passRate > b.passRate || a.score > b.score);
  }

  paretoAddVersion(wingId, versionId, passRate, score, content, meta = {}) {
    const versions = this.listActiveVersions(wingId);
    let dominated = false;
    let dominatedBy = null;

    for (const v of versions) {
      if (this.dominates({ passRate: v.pass_rate, score: v.score }, { passRate, score })) {
        dominated = true;
        dominatedBy = v.id;
        break;
      }
    }

    if (!dominated) {
      for (const v of versions) {
        if (v.version_id !== versionId) {
          if (this.dominates({ passRate, score }, { passRate: v.pass_rate, score: v.score })) {
            this.db.run(`UPDATE versions SET dominated = 1, dominated_by_id = (SELECT id FROM versions WHERE version_id = '${versionId.replace(/'/g, "''")}') WHERE id = ${v.id}`);
          }
        }
      }
    }

    const entry = this.addVersion(wingId, versionId, passRate, score, dominated, dominatedBy, meta);
    if (!dominated && content) {
      const room = this.upsertRoom(wingId, versionId, 'hall_evals');
      this.addDrawer(room.id, content, versionId, { passRate, score, dominated });
    }
    this._persist();
    return { ...entry, dominated };
  }

  paretoReport(wingId) {
    const all = this.listAllVersions(wingId);
    const active = all.filter(v => !v.dominated);
    const best = active.sort((a, b) => b.pass_rate - a.pass_rate)[0] || null;
    return {
      total: all.length,
      active: active.length,
      dominated: all.length - active.length,
      best: best ? { passRate: best.pass_rate, score: best.score, id: best.version_id } : null,
      history: all.map(v => ({
        id: v.version_id,
        passRate: v.pass_rate,
        score: v.score,
        dominated: !!v.dominated,
        created_at: v.created_at
      }))
    };
  }

  searchMemory(wingId, hallType, keywords) {
    const halls = this.searchHalls(wingId, hallType, keywords);
    return halls.map(h => {
      try { h.dataParsed = JSON.parse(h.data); } catch { h.dataParsed = h.data; }
      return h;
    });
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function escape(s) {
  return String(s).replace(/'/g, "''");
}

module.exports = { PalaceStore };
