---
name: cognitive-memory
description: |
  Unified memory system — multi-store architecture (episodic/semantic/procedural/core), knowledge graph, vector+BM25 retrieval, WAL protocol, memory palace, decay model, reflection, hygiene, and multi-agent support.
  Triggers on any memory operation: remember, forget, recall, reflect, knowledge graph, semantic search, or memory maintenance.
---

# Cognitive Memory — Unified

A single comprehensive memory system combining 6 proven approaches into one architecture.

## Architecture Overview

```
CONTEXT WINDOW (always loaded)
├── System Prompts
├── Core Memory / MEMORY.md (~3K tokens) ← always in context
└── Conversation

MEMORY STORES (retrieved on demand)
├── Hot RAM    — SESSION-STATE.md (WAL protocol, survives compaction)
├── Episodic   — chronological event logs (append-only)
├── Semantic   — knowledge graph (entities + relationships)
├── Procedural — learned workflows and patterns
├── Vault      — user-pinned, never auto-decayed
└── Cold Store — Git-Notes knowledge graph (permanent decisions)

RETRIEVAL ENGINES
├── Vector Search    — dense embeddings (OpenAI) for semantic similarity
├── BM25             — sparse keyword scoring
├── Hybrid           — vector + BM25 combined, reranked
├── Graph Traversal  — entity/relation queries
└── Memory Palace    — spatial/associative recall

MAINTENANCE
├── Decay Model   — relevance(t) = base × e^(-0.03 × days) × log2(access) × type_weight
├── Reflection    — internal monologue, identity consolidation
├── Hygiene       — dedup, prune, compress, optimize
└── Audit         — git + audit.log for all mutations
```

---

## Layer 1: Hot RAM (SESSION-STATE.md)

Write-Ahead Log protocol. Write state BEFORE responding.

```
## Current Task
[What we're working on RIGHT NOW]

## Key Context
- User preference: ...
- Decision made: ...
- Blocker: ...

## Pending Actions
- [ ] ...
```

**Rule:** Write BEFORE responding. Triggered by any user input with concrete detail.

---

## Layer 2: Multi-Store Memory

### File Structure
```
workspace/
├── MEMORY.md              # Core memory (curated, ~3K tokens)
├── IDENTITY.md            # Facts + Self-Image
├── SOUL.md                # Values + Principles + Boundaries
├── SESSION-STATE.md       # Hot RAM (WAL)
├── memory/
│   ├── episodes/          # Daily logs: YYYY-MM-DD.md
│   ├── graph/             # Knowledge graph
│   │   ├── index.md       # Entity registry + edges
│   │   ├── entities/      # One file per entity
│   │   └── relations.md   # Edge type definitions
│   ├── procedures/        # Learned workflows
│   ├── vault/             # Pinned memories (no decay)
│   ├── ontology/          # Typed knowledge graph (JSONL)
│   │   ├── graph.jsonl    # Append-only entity store
│   │   └── schema.yaml    # Type constraints
│   ├── palaces/           # Memory palace structures
│   └── meta/
│       ├── decay-scores.json
│       ├── reflection-log.md
│       ├── reward-log.md
│       └── audit.log
└── .git/                  # Audit ground truth
```

### Typed Knowledge Graph (Ontology)

```yaml
Types: Person, Organization, Project, Task, Event, Document, Message, Goal, Note, Account, Device, Credential, Action, Policy
```

```bash
# Create entity
python3 scripts/ontology.py create --type Person --props '{"name":"Alice"}'

# Query
python3 scripts/ontology.py query --type Task --where '{"status":"open"}'

# Relate entities
python3 scripts/ontology.py relate --from proj_001 --rel has_task --to task_001

# Validate constraints
python3 scripts/ontology.py validate
```

### Memory Palace (Spatial)

Create virtual memory palaces with spatial layouts. Associate info with locations. Navigate for guided recall.

---

## Layer 3: Retrieval

### Hybrid Search (Vector + BM25)

```bash
# Semantic search (requires OPENAI_API_KEY)
# Performs dense embedding + BM25 hybrid, reranked
```

### Graph Traversal

```bash
# Follow relationships between entities
# Get all tasks related to a project
# Find dependency chains
```

### Memory Palace Navigation

Trace paths through spatial layouts for associative recall.

---

## Layer 4: Decay & Hygiene

### Decay Model
```
relevance(t) = base × e^(-0.03 × days_since_access) × log2(access_count + 1) × type_weight
```

| Score | Status |
|-------|--------|
| 1.0–0.5 | Active |
| 0.5–0.2 | Fading |
| 0.2–0.05 | Dormant |
| < 0.05 | Archived |

Type weights: core=1.5, episodic=0.8, semantic=1.2, procedural=1.0, vault=∞

### Hygiene Operations
- Detect and remove duplicate/near-duplicate entries
- Prune outdated, expired, or irrelevant memories
- Optimize indexing for faster retrieval
- Compress and consolidate related memories
- Generate health reports and statistics

---

## Layer 5: Reflection & Self-Image

1. User triggers "reflect" or end-of-session
2. Request tokens for reflection
3. Internal monologue reviewing recent episodes
4. Update IDENTITY.md Self-Image sections
5. Log to reflection-log.md and reward-log.md

See `references/reflection-process.md` for full details.

---

## Layer 6: Multi-Agent Support

**Model: Shared Read, Gated Write**
- All agents READ all stores
- Main agent WRITES directly
- Sub-agents PROPOSE → `pending-memories.md`
- 3 sub-agents → 2 confirmations required

---

## Layer 7: Audit Trail

**Layer 1: Git** — Every mutation = atomic commit
**Layer 2: audit.log** — One-line queryable summary

Actor types: `bot:trigger-remember`, `reflection:SESSION_ID`, `system:decay`, `manual`, `subagent:NAME`

---

## Trigger System

| Trigger | Action |
|---------|--------|
| "remember", "note that", "keep in mind" | Classify → write to appropriate store |
| "forget", "disregard", "scratch that" | Confirm → soft-archive |
| "reflect", "consolidate memories" | Run reflection cycle |
| "what do I know about X" | Query graph + vector stores |
| "link X to Y" | Create ontology relation |
| "clean memory", "memory health" | Run hygiene cycle |

---

## Quick Setup

```bash
# Initialize memory structure
bash scripts/init_memory.sh /path/to/workspace

# Verify
mkdir -p memory/ontology
touch memory/ontology/graph.jsonl

# Optional: LanceDB for vector search
# Requires OPENAI_API_KEY
```

## Requirements

- No API keys required for basic operation
- `OPENAI_API_KEY` for vector search (OpenViking hybrid retrieval)
- See individual sub-modules for their specific requirements

## References

- `references/architecture.md` — Full architecture design
- `references/reflection-process.md` — Reflection philosophy
- `references/routing-prompt.md` — Memory classifier prompt
- `references/schema.md` — Ontology type definitions
- `references/queries.md` — Ontology query examples
