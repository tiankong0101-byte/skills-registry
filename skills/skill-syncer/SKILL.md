---
name: skill-syncer
description: |
  Synchronize skills across multiple agent platforms and directories.
metadata:
  openclaw:
    emoji: 🔄
  security:
    allowed_domains: []
---

# skill-syncer

## Trigger Conditions

- User installs a new skill and wants it available everywhere
- Synchronizing skills between OpenCode, iFlow CLI, OpenClaw, and iFlow-bot
- Updating skills across all configured platform directories
- After skill creation or modification, propagating changes

## Usage

1. **Sync a skill to all platforms**:
   ```
   skill-syncer sync --name <skill-name> --source <source-path>
   ```

2. **Sync all skills** across all configured directories:
   ```
   skill-syncer sync-all
   ```

3. **Check sync status** (which skills are out of date):
   ```
   skill-syncer status
   ```

4. **Configure target directories**:
   ```
   skill-syncer config --add-target <platform> <path>
   ```

## Requirements

- No environment variables required
- Read access to source skill directory
- Write access to all target platform directories:
  - `~/.config/opencode/skills/` (OpenCode)
  - `~/.iflow/skills/` (iFlow CLI)
  - `~/.openclaw/workspace/skills/` (OpenClaw)
  - `~/.iflow-bot/workspace/skills/` (iFlow-bot)
- File comparison utilities for change detection
