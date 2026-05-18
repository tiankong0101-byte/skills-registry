---
name: skill-format-v2
description: "Enhanced SKILL.md format inspired by Claude Code. Use when creating or upgrading skills to include rich metadata, conditional activation, tool restrictions, and multi-agent patterns. Triggers: 'create skill', 'upgrade skill', 'add metadata', 'conditional skill'."
---

# Skill Format V2 — Claude Code-Inspired Enhanced Format

This skill defines the enhanced SKILL.md format with rich metadata inspired by Claude Code's skill system.

## Enhanced Frontmatter Fields

```yaml
---
name: skill-name                    # Unique identifier (required)
description: |                     # When to use this skill (required)
  One or more paragraphs describing when to invoke this skill.
  Include trigger phrases and context.
  
trigger: |                         # Alternative trigger phrases
  - "keyword1"
  - "keyword2"

# --- Claude Code Inspired Fields ---

allowed-tools:                      # Restrict tools this skill can use
  - Read
  - Edit
  - Bash(git:*)

disallowed-tools:                  # Tools explicitly denied
  - Write
  - WebFetch

context: fork                      # Run as sub-agent (vs inline execution)
  agent: researcher                # Agent type for forked execution
  parallel: 3                     # Max parallel forks

model: inherit                     # Model selection
  # inherit = use current model
  # sonnet = force Sonnet
  # opus = force Opus
  # specific model string

disable-model-invocation: false    # True = shell-only, no LLM call

user-invocable: true               # Can user trigger via slash command
  slash-name: /skill-name

effort: medium                     # Effort level hint (low/medium/high/max)

paths:                             # Conditional activation by file paths
  - "**/*.py"                      # Activate for Python files
  - "**/*.ts"                      # Activate for TypeScript files
  exclude:
  - "**/node_modules/**"

hooks:
  pre-execute: |                   # Run before skill execution
    echo "Starting skill..."
  post-execute: |                  # Run after skill execution
    echo "Skill complete"

agent-type: coordinator             # coordinator / worker / solo
max-retries: 3                    # Retry on failure
timeout: 300000                    # Max execution time (ms)
---
```

## Frontmatter Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Unique skill identifier |
| `description` | string | ✅ | When to use this skill |
| `trigger` | string[] | ❌ | Alternative trigger keywords |
| `allowed-tools` | string[] | ❌ | Tools this skill MAY use |
| `disallowed-tools` | string[] | ❌ | Tools this skill CANNOT use |
| `context` | string | ❌ | `inline` (default) or `fork` |
| `agent` | string | ❌ | Agent type for forked execution |
| `parallel` | number | ❌ | Max parallel forks (for context:fork) |
| `model` | string | ❌ | Model override |
| `disable-model-invocation` | boolean | ❌ | True = no LLM, shell only |
| `user-invocable` | boolean | ❌ | Enable slash command |
| `slash-name` | string | ❌ | Custom slash command name |
| `effort` | string | ❌ | Effort level: low/medium/high/max |
| `paths` | string[] | ❌ | File patterns that activate this skill |
| `exclude` | string[] | ❌ | Exclude patterns |
| `hooks.pre-execute` | string | ❌ | Pre-execution hook |
| `hooks.post-execute` | string | ❌ | Post-execution hook |
| `agent-type` | string | ❌ | coordinator/worker/solo |
| `max-retries` | number | ❌ | Retry count on failure |
| `timeout` | number | ❌ | Max execution time (ms) |

## Skill Types

### 1. Inline Skill (Default)
```yaml
---
name: my-inline-skill
description: Executes inline with the main agent
---
Skill content here...
```

### 2. Fork Skill (Sub-Agent)
```yaml
---
name: my-fork-skill
description: Runs as a separate sub-agent
context: fork
agent: researcher
parallel: 3
---
Fork skill content here...
```

### 3. Shell-Only Skill (No LLM)
```yaml
---
name: my-shell-skill
description: Pure shell command skill
disable-model-invocation: true
---
Shell commands and scripts here...
```

### 4. Conditional Skill (Path-Activated)
```yaml
---
name: python-expert
description: Activated when working with Python files
paths:
  - "**/*.py"
  - "**/pyproject.toml"
exclude:
  - "**/venv/**"
---
Python-specific expertise here...
```

### 5. Coordinator Skill (Multi-Agent)
```yaml
---
name: research-team
description: Orchestrate multiple research sub-agents
context: fork
agent: coordinator
parallel: 5
allowed-tools:
  - Bash
  - Read
---
Coordinator prompt here...
```

## Best Practices

1. **Keep frontmatter minimal** — Only include fields you actually need
2. **Use `allowed-tools`** for security-sensitive skills
3. **Use `context: fork`** for long-running independent tasks
4. **Use `paths`** for file-type-specific expertise
5. **Use `model`** to optimize cost vs. quality
6. **Always set `timeout`** for forked skills

## Converting Existing Skills

To upgrade an existing skill:

1. Add YAML frontmatter with `name` and `description`
2. Add `allowed-tools` to restrict sensitive operations
3. Add `paths` if the skill is file-type-specific
4. Consider `context: fork` for parallelizable tasks
5. Add `hooks` if pre/post actions are needed
