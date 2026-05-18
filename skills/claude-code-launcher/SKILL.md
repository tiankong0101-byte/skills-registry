---
name: claude-code-launcher
description: "Launcher for Claude Code (claude-code-haha). Provides quick access to the locally-runnable Claude Code with NVIDIA NIM integration. Triggers: 'run claude-code', 'use claude-code', 'claude ha', 'launch claude', 'invoke claude-code'"
---

# Claude Code Launcher

Quick launcher for the locally-runnable Claude Code (claude-code-haha) with NVIDIA NIM API.

## Installation

Claude Code is already installed at:
```
C:\Users\TIAN\.iflow-bot\workspace\repos\claude-code-haha\
```

## Quick Commands

### Interactive TUI Mode
```bash
bun --env-file=.env ./src/localRecoveryCli.ts
```
Opens a readline-based interactive chat with Claude Code.

### Single Prompt Mode
```bash
bun --env-file=.env ./src/localRecoveryCli.ts -p "your question"
```

### With Custom Model
```bash
bun --env-file=.env ./src/localRecoveryCli.ts --model qwen/qwen2.5-coder-7b-instruct -p "your question"
```

### JSON Output
```bash
bun --env-file=.env ./src/localRecoveryCli.ts --output-format json -p "your question"
```

## Available Models (NVIDIA NIM)

| Model | Strength | Command Flag |
|-------|----------|-------------|
| `qwen/qwen2.5-coder-7b-instruct` | **Code** ⭐ | `--model qwen/qwen2.5-coder-7b-instruct` |
| `meta/llama-3.1-8b-instruct` | General | (default) |
| `meta/llama-3.2-3b-instruct` | Fast/light | `--model meta/llama-3.2-3b-instruct` |
| `google/gemma-3-4b-it` | Small model | `--model google/gemma-3-4b-it` |
| `deepseek-ai/deepseek-v3.2` | Chinese | `--model deepseek-ai/deepseek-v3.2` |
| `mistralai/mistral-7b-instruct-v0.3` | General | `--model mistralai/mistral-7b-instruct-v0.3` |

Full model list: https://integrate.api.nvidia.com/

## .env Configuration

```env
NVIDIA_API_KEY=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
OPENAI_BASE_URL=https://integrate.api.nvidia.com/v1
OPENAI_MODEL=qwen/qwen2.5-coder-7b-instruct
API_TIMEOUT_MS=3000000
```

## Integration with OpenClaw

Add to your workflow for coding tasks:

```
> Use Claude Code for: complex coding tasks, debugging, code review
> Use OpenCode for: general tasks, research, writing, planning
```

## Limitations

- **No Ink TUI** in Recovery CLI mode (readline-based only)
- **No file editing tools** — Recovery CLI is text-only
- **No MCP servers** in Recovery CLI mode
- **No Skills system** in Recovery CLI mode

For full Claude Code features, use the official Claude Code or wait for the TUI to be fixed.

## Upgrade Path

The claude-code-haha repo is actively maintained. To update:
```bash
cd C:\Users\TIAN\.iflow-bot\workspace\repos\claude-code-haha
git pull
bun install
```
