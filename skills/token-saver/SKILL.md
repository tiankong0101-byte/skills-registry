---
name: token-saver
description: |
  Multi-level token optimization for OpenCode conversations. Response compression, context pruning, selective detail, and memory compression. Use when context window is full, token costs matter, or user explicitly requests token saving. Triggered by "save tokens", "compress", "token saver", or any mention of reducing token usage.
metadata:
  openclaw:
    emoji: 🪙
  security: {}
---

# Token Saver

Four-level token optimization system. Each level can be activated independently. Works with OpenCode + Hermes dual-agent setup.

## Precision Guard

Auto-detects when compression would risk precision. Evaluated before every compression decision.

### Auto-Trigger Rules (skip L2+L3, keep L1 only)
Current turn involves any of:

- **Code tasks**: implement, fix, refactor, rewrite, debug, design, architect, test,重构, 实现, 修复, 调试, 设计
- **Exact values**: error codes, stack traces, version numbers, commit hashes, config values, paths, port numbers, IPs, UUIDs
- **Tool output**: compiler errors, test failures, diff output, lint warnings
- **Config changes**: any command modifying config files (YAML, JSON, TOML, .env, .ini)
- **User provided raw data**: code blocks, JSON, XML, YAML, SQL in user message
- **Precision keywords**: "精确", "准确", "exact", "preserve", "maintain", "keep", "注意", "important", "勿改",勿删

### Precision Mode
- `full precision` / `精准模式`: user says this → skip all compression (L1-L4 off) until `resume compression`
- `precision auto` (default): Precision Guard decides per turn
- `compress everything`: user says this → override guard, apply all levels

### Summary

| Scenario | Result |
|---|---|
| Coding task | L1 only |
| Debugging/fixing | L1 only |
| Reading/modifying config | L1 only |
| User provides exact data | L1 only |
| User says "full precision" | All compression off |
| Casual chat / status / info request | All levels on |

## Level 1: Output Compression

Compress responses without losing substance.

### Rules
- Drop filler words: 真的, 其实, 基本上, 实际上, 只不过, 当然, 那么, 就是 — 以及对应的英文 (really, actually, basically, just, simply, of course, well, so)
- Drop pleasantries: 不客气, 没问题, 很高兴, 请, 谢谢 — 以及英文对应 (you're welcome, no problem, happy to, please, thanks)
- Merge short sentences. `A. B. C.` → `A -> B -> C.`
- Code blocks: full fidelity, no compression
- Error messages: quoted exact, no compression
- File paths, command names, API names: exact, no compression
- One blank line between sections, not two
- Lists: prefer inline `(1)...(2)...` over multi-line when < 10 words per item

### Compression Ratios
- `light` (default): ~25% token reduction — just filler removal
- `medium`: ~40% — filler + sentence merging + shorter phrasing
- `aggressive`: ~60% — keyword-only style, fragments, heavy merging

## Level 2: Context Pruning

Manage conversation history to keep context window lean.

### Rules
- Every 10 turns: summarize preceding 10 turns into 1-2 sentences, store in session scratchpad
- When context approaches ~75% window: replace oldest 30% of history with summary
- Truncated messages: replace with `[user asked about X — summarized]`
- Tool outputs: keep only result summary, trim full stdout/stderr unless error
- File reads: keep only relevant lines, replace rest with `[...]`

### Implementation
1. Track turn count and approximate token usage
2. At threshold, produce: `## Context Summary (turns 1-10)\n{summary}\n## Current (turns 11-N)\n{full}`
3. Store summaries in session scratchpad for recall if needed

## Level 3: Selective Detail

Match response detail to question scope.

### Rules
- **Greeting / status check**: 1-3 lines max
- **"What is X"**: 1 paragraph or 3 bullet points
- **"How to do X"**: steps only, no theory. 1 line per step
- **"Compare X and Y"**: table or 2 bullet pairs. 1 line each
- **"Debug X"**: hypothesis → evidence → fix. 1 line each
- **"Why does X work"**: root cause only, 1-2 sentences
- **"List / enumerate"**: flat list, no descriptions unless asked
- **"Design / plan X"**: structured (approach → tradeoffs → recommendation), but compress each section to 1-3 lines

### Ask vs Tell
- If question is specific: answer direct, no background
- If question is vague: offer 2-3 focused options, one line each
- If user says "tell me more" or "details": expand from compressed → full

## Level 4: Memory Compression

When used with Hermes dual-agent setup, compress memories before storage.

### Rules
- Extract key-value facts only: `key: value`
- Drop context/setup/narrative from memory entries
- Store compressed facts: `[topic] -> [fact] (confidence: 0.X)`
- Max 200 chars per memory entry
- Tag with category: `code`, `config`, `preference`, `project`, `person`

### Usage
```
hermes --mem "code: python logging pattern -> structlog over logging (conf: 0.9)"
```

## Quick Reference

| Level | Method | Reduction | Effort |
|---|---|---|---|
| 1 | Output Compression | 25-60% | Auto |
| 2 | Context Pruning | 30-50% of history | Auto |
| 3 | Selective Detail | 40-70% per response | In-the-moment |
| 4 | Memory Compression | 50-80% of memory | Background |

## Trigger Phrases
- "save tokens" / "省点 tokens"
- "compress" / "压缩"
- "token saver" / 调用此 skill
- Context window approaching limit (auto-detect)
- Long session (>30 turns, auto-suggest Level 2)
