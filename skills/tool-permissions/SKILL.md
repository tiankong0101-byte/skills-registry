---
name: tool-permissions
description: "Tool permission rules engine inspired by Claude Code. Implements per-tool permission confirmation, rule-based access control, and auto-classification. Triggers: 'permission', 'tool access', 'security', 'approve tool', 'deny tool', 'set permission', 'security rules'"
---

# Tool Permission System

Rule-based tool permission engine inspired by Claude Code's security architecture.

## Permission Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| `default` | Ask user for each sensitive tool | Normal use |
| `acceptEdits` | Auto-accept file edits | Trusted workspace |
| `plan` | Read-only, deny writes | Planning/review |
| `bypassPermissions` | Skip all prompts | CI/Sandbox only |
| `dontAsk` | Deny all sensitive tools | Maximum security |
| `auto` | ML classifier decides | Advanced users |

## Permission Rule Format

Rules are defined in `permissions.json` in the workspace:

```json
{
  "version": "1.0",
  "mode": "default",
  "rules": [
    {
      "tool": "Bash",
      "action": "allow",
      "conditions": [
        { "type": "command-match", "pattern": "git:*" },
        { "type": "command-match", "pattern": "npm:*" },
        { "type": "command-match", "pattern": "pnpm:*" }
      ]
    },
    {
      "tool": "Bash",
      "action": "ask",
      "conditions": [
        { "type": "command-match", "pattern": "rm:*" },
        { "type": "command-match", "pattern": "sudo:*" }
      ]
    },
    {
      "tool": "Bash",
      "action": "deny",
      "conditions": [
        { "type": "command-match", "pattern": "curl:*|wget:*|nc:*" }
      ]
    },
    {
      "tool": "Write",
      "action": "ask",
      "conditions": [
        { "type": "path-match", "pattern": "**/.env" },
        { "type": "path-match", "pattern": "**/*.key" }
      ]
    },
    {
      "tool": "Read",
      "action": "allow",
      "conditions": []
    },
    {
      "tool": "Edit",
      "action": "acceptEdits",
      "conditions": [
        { "type": "path-match", "pattern": "src/**" },
        { "type": "path-match", "pattern": "*.md" }
      ]
    }
  ]
}
```

## Condition Types

| Type | Description | Example |
|------|-------------|---------|
| `command-match` | Shell command glob pattern | `git:*`, `rm:*rf` |
| `path-match` | File path glob pattern | `**/.env`, `src/**` |
| `file-size-max` | Max file size in bytes | `1048576` (1MB) |
| `time-window` | Time-based restriction | `09:00-18:00` |
| `user-confirmed` | Requires explicit user OK | `true` |

## Tool Categories

```
SENSITIVE (always ask by default):
  - Bash (any command)
  - Write (any file creation)
  - WebFetch (network access)
  - Bash(npm:*|pnpm:*) (package installs)

MODERATE (ask for patterns):
  - Edit (existing files)
  - MultiEdit (batch changes)
  - Bash(git:*|ls:*|cat:*|grep:*|find:*)

SAFE (auto-allow):
  - Read
  - Glob
  - Grep
  - TodoWrite
```

## Permission Check Flow

```
Tool Call Request
       │
       ▼
┌──────────────────┐
│ Check Tool Category │
└────────┬─────────┘
         │
    ┌────┴────┐
    │ Safe?   │
    └────┬────┘
     Yes │      No
         ▼      │
  [AUTO-ALLOW]  ▼
┌──────────────────┐
│ Match Rules?     │
└────────┬─────────┘
         │
    ┌────┴────┐
    │ Rule    │ No Rule
    │ Found?  │ Found?
    └────┬────┘
         │      │
      Yes │      ▼
         ▼   [ASK USER]
┌──────────────────┐
│ Rule: Allow/    │
│ Deny/Ask/Accept │
└──────────────────┘
```

## Quick Setup

### For Trusted Workspace
```json
{
  "mode": "acceptEdits",
  "rules": [
    { "tool": "Read", "action": "allow", "conditions": [] },
    { "tool": "Glob", "action": "allow", "conditions": [] },
    { "tool": "Grep", "action": "allow", "conditions": [] },
    { "tool": "Bash", "action": "ask", "conditions": [] }
  ]
}
```

### For CI/Sandbox
```json
{
  "mode": "bypassPermissions",
  "rules": []
}
```

### For Planning
```json
{
  "mode": "plan",
  "rules": [
    { "tool": "Read", "action": "allow", "conditions": [] },
    { "tool": "Glob", "action": "allow", "conditions": [] },
    { "tool": "Grep", "action": "allow", "conditions": [] }
  ]
}
```

## Implementation Notes

The permission engine should:
1. Load rules from `permissions.json` on startup
2. Check rules in order (first match wins)
3. Fall back to mode default if no rule matches
4. Log all permission decisions
5. Support hot-reload of rules (edit `permissions.json` without restart)
