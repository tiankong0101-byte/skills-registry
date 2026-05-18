---
name: workspace-audit
version: 1.0.0
description: 扫描并生成所有技能目录的清单报告。对比不同智能体目录（iFlow CLI / OpenCode / OpenClaw / iflow-bot）中的 skills 同步状态，识别版本差异和孤立技能。触发词：技能审计、workspace audit、技能清单、技能同步状态、查看所有技能、skill inventory。
---

# Workspace Audit - 技能目录清单与同步审计

自动扫描并生成所有技能目录的完整清单报告。

## 核心目录

| 目录 | 路径 | 智能体 |
|------|------|--------|
| iFlow CLI | `C:\Users\chentian\skills\` | 菲菲（iFlow CLI） |
| OpenCode | `C:\Users\chentian\.config\opencode\skills\` | 菲菲（OpenCode） |
| OpenClaw | `C:\Users\chentian\.openclaw\workspace\skills\` | 小龙虾 |
| iflow-bot | `C:\Users\chentian\.iflow-bot\workspace\skills\` | 大龙虾 |

## 执行流程

### 第一步：扫描所有目录

用 Bash 工具依次扫描每个目录：

```bash
# iFlow CLI
Get-ChildItem "C:\Users\chentian\skills\" -Name -ErrorAction SilentlyContinue

# OpenCode
Get-ChildItem "C:\Users\chentian\.config\opencode\skills\" -Name -ErrorAction SilentlyContinue

# OpenClaw
Get-ChildItem "C:\Users\chentian\.openclaw\workspace\skills\" -Name -ErrorAction SilentlyContinue

# iflow-bot
Get-ChildItem "C:\Users\chentian\.iflow-bot\workspace\skills\" -Name -ErrorAction SilentlyContinue
```

### 第二步：识别核心技能列表

根据 AGENTS.md 中的"技能共享原则"，核心共享技能包括：
- agent-browser, capability-evolver, ddg-search-privacy, deep-research-pro
- find-skills, github, humanizer, image, memory-hygiene, octoflow
- openai-whisper, openviking, self-improving-agent, skill-creator, skill-vetter
- skillhub-preference, soul-companion, summarize, tavily-search, web-search-ex-skill
- ytdlp-transcript, self-learning-skill-v2, proactive-agent, markdown-converter, url-reader
- multi-search-engine, minimax-multimodal-toolkit, minimax-pdf, minimax-xlsx

### 第三步：生成清单报告

报告格式：

```
# 技能目录审计报告
生成时间：[当前时间]

## 各目录技能数量

| 目录 | 技能数 |
|------|--------|
| iFlow CLI | X |
| OpenCode | X |
| OpenClaw | X |
| iflow-bot | X |

## 核心技能同步状态

| 技能 | iFlow CLI | OpenCode | OpenClaw | iflow-bot | 状态 |
|------|-----------|----------|----------|-----------|------|
| xxx | ✅ | ✅ | ❌ | ✅ | 缺失 |

## 孤立技能（仅存在于某一目录）

[列出仅在一个目录中存在的技能]

## 未同步的技能

[列出存在于某些目录但不在核心列表的技能]
```

### 第四步：同步建议

根据审计结果，提供同步建议：
- 哪些核心技能缺失
- 哪些技能版本可能过时
- 推荐的同步操作

## 注意事项

- 使用 PowerShell 兼容命令（Get-ChildItem）
- 目录不存在时使用 `-ErrorAction SilentlyContinue` 忽略错误
- 技能共享原则写入 AGENTS.md，确保每次同步后更新长期记忆
