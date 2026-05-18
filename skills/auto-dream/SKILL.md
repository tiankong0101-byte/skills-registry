---
name: auto-dream
description: "Background memory consolidation service (autoDream). Automatically distills daily logs into topic memories. Triggers: 'consolidate memory', 'dream', 'organize memories', 'background memory', 'auto consolidate'"
---

# autoDream — Background Memory Consolidation

Automatic memory consolidation that runs as a background task, inspired by Claude Code's KAIROS system.

## Overview

```
Daily Sessions → Daily Logs → Consolidation → Topic Files → MEMORY.md
     ↓              ↓              ↓                ↓             ↓
  (write)      (append)      (distill)       (update)    (reindex)
```

autoDream fires when:
- **Time gate**: ≥24 hours since last consolidation
- **Session gate**: ≥5 new sessions since last run
- **Manual trigger**: User says "dream" or "consolidate memories"

## Consolidation Prompts

### Dream Consolidation Prompt

```
You are consolidating memories from recent sessions.
Your task: distill daily logs into durable, accurate topic memories.

INPUT: Daily logs from the past [N] days
OUTPUT: Updated topic files + MEMORY.md pointers

RULES:
1. Extract NEW information (ignore stale/contradicted data)
2. Merge related topics (avoid duplication)
3. Preserve source attribution (which log did info come from?)
4. Mark uncertain memories with [VERIFY] tag
5. Delete fully superseded entries
6. Update `updated:` dates on revised topics
7. Keep topics focused (one topic = one theme)

TOPIC TAXONOMY:
- user: Goals, preferences, known context
- feedback: Guidance to avoid/repeat
- project: Ongoing work, goals, decisions
- reference: External pointers (URLs, IDs)
- insight: Key learnings
- task: Current task state

FORMAT:
For each topic change:
  [CREATE/UPDATE/DELETE]: topic-name.md
  Summary: [what changed and why]
```

## File-Based Lock

Prevents concurrent consolidation (important for shared memory):

```javascript
// consolidationLock.ts
const LOCK_FILE = '.autoDream.lock';

async function acquireLock(workspace) {
  const lockPath = path.join(workspace, LOCK_FILE);
  const pid = process.pid;
  const timestamp = Date.now();
  
  try {
    await writeFile(lockPath, JSON.stringify({ pid, timestamp }));
    return true;
  } catch (e) {
    if (e.code === 'EEXIST') {
      const existing = JSON.parse(await readFile(lockPath));
      // Check if process is still alive
      if (await isProcessAlive(existing.pid)) {
        return false; // Another consolidation is running
      }
      // Stale lock — take over
      await writeFile(lockPath, JSON.stringify({ pid, timestamp }));
      return true;
    }
    return false;
  }
}

async function releaseLock(workspace) {
  const lockPath = path.join(workspace, LOCK_FILE);
  await unlink(lockPath).catch(() => {});
}
```

## Consolidation Workflow

```javascript
async function autoDream(workspace) {
  // 1. Acquire lock
  if (!await acquireLock(workspace)) {
    console.log('[autoDream] Already running, skipping.');
    return;
  }
  
  try {
    // 2. Load daily logs
    const logs = await loadDailyLogs(workspace, days = 7);
    if (logs.length === 0) {
      console.log('[autoDream] No logs to consolidate.');
      return;
    }
    
    // 3. Load current topics
    const topics = await loadTopics(workspace);
    
    // 4. Run consolidation (forked agent)
    const consolidated = await runConsolidationAgent(logs, topics);
    
    // 5. Apply changes
    for (const change of consolidated.changes) {
      if (change.action === 'CREATE') {
        await writeTopic(workspace, change.topic, change.content);
      } else if (change.action === 'UPDATE') {
        await updateTopic(workspace, change.topic, change.patch);
      } else if (change.action === 'DELETE') {
        await deleteTopic(workspace, change.topic);
      }
    }
    
    // 6. Reindex MEMORY.md
    await reindexMemory(workspace);
    
    // 7. Record consolidation
    await writeFile(
      path.join(workspace, '.autoDream.last'),
      JSON.stringify({ timestamp: Date.now(), changes: consolidated.changes.length })
    );
    
    console.log(`[autoDream] Complete. ${consolidated.changes.length} changes.`);
  } finally {
    // 8. Release lock
    await releaseLock(workspace);
  }
}
```

## Scheduling

### Time-based trigger (Node.js)

```javascript
// Schedule autoDream to run daily at 3 AM
const cron = require('node-cron');
cron.schedule('0 3 * * *', async () => {
  console.log('[autoDream] Scheduled consolidation starting...');
  const workspaces = await getActiveWorkspaces();
  for (const ws of workspaces) {
    if (shouldConsolidate(ws)) {
      await autoDream(ws);
    }
  }
});
```

### Session-count trigger

```javascript
// After each session
async function onSessionEnd(workspace) {
  const sessions = getSessionCountSinceLastDream(workspace);
  if (sessions >= 5) {
    console.log('[autoDream] Session threshold reached, consolidating...');
    await autoDream(workspace);
  }
}
```

## Manual Trigger

User can force consolidation:

```
> dream
[autoDream] Manual consolidation triggered.
[autoDream] Loading 7 days of logs...
[autoDream] Running consolidation agent...
[autoDream] Complete. 12 changes applied.
```

## Safety Guards

1. **Lock prevents concurrent runs**
2. **Always keep raw logs** (never delete, only archive)
3. **Mark uncertain consolidations** with [VERIFY]
4. **Max 20% of topic content changed per consolidation**
5. **Preserve original source attribution**
6. **Abort if <24h since last run** (unless manual)

## Configuration

```yaml
# .autoDream.config.yaml
enabled: true
schedule: "0 3 * * *"  # Daily at 3 AM
time-gate-hours: 24
session-gate: 5
log-days: 7
max-changes-per-run: 20  # Cap changes to prevent aggressive deletion
notify-on-complete: true
```

## Integration with Memory Architecture

autoDream is the bridge between Layer 3 (daily logs) and Layer 2 (topic files):

```
┌────────────────────────────────────────────┐
│  Layer 3: Daily Logs                        │
│  (raw, append-only, never deleted)          │
└──────────────────────┬─────────────────────┘
                       │ autoDream distillation
┌──────────────────────▼─────────────────────┐
│  Layer 2: Topic Files                       │
│  (curated, typed, versioned)                │
└──────────────────────┬─────────────────────┘
                       │ reindex
┌──────────────────────▼─────────────────────┐
│  Layer 1: MEMORY.md                         │
│  (live index, max 200 lines)                │
└────────────────────────────────────────────┘
```
