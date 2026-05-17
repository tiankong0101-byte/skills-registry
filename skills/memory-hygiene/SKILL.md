---
name: memory-hygiene
description: |
  Memory maintenance, cleanup and optimization for agent systems. Triggers on memory cleanup tasks, deduplication, pruning stale memories, and optimizing memory storage.
metadata:
  openclaw:
    emoji: 🧹
    requires:
      env: []
    primaryEnv: ''
  security:
    allowed_domains: []
---

# memory-hygiene

## Trigger Conditions

Activate when performing memory maintenance operations — cleaning up stale or redundant entries, deduplicating similar memories, pruning expired context, optimizing storage usage, or running scheduled memory maintenance routines.

## Usage

Maintains memory health through automated cleanup and optimization:

- Detect and remove duplicate or near-duplicate memory entries
- Prune outdated, expired, or irrelevant memories
- Optimize memory indexing for faster retrieval
- Compress and consolidate related memories
- Generate memory health reports and statistics
- Schedule regular maintenance cycles

## Requirements

No API keys required. Operates on the local memory storage system.
