---
name: instinct-system
description: 从会话历史自动提取模式，置信度评分，支持导入导出，一键进化为完整 Skill。介于原始笔记和完整 Skill 之间的轻量级模式库。源自 everything-claude-code 的 continuous-learning-v2 设计，结合 EvoSkills 协同进化验证框架。
triggers:
  - 提取模式
  - instinct
  - 学习模式
  - 从会话学习
  - pattern
  - 轻量模式库
features:
  - 模式提取
  - 置信度评分
  - 导入导出
  - 进化为Skill
  - 协同验证
dangerLevel: low
---

# Instinct System — 轻量级模式库

> 介于原始笔记和完整 Skill 之间的中间态。够轻可以随手记，够结构化可以复用，够积累可以进化。

## 核心理念

每当你完成一个任务，发现了一个有效的方法或思路，立即记录为一个 **Instinct**。
Instinct 是未成熟的 Skill——还需要验证，但已经值得保留。
积累足够多的同类型 Instinct 后，通过 `/evolve` 将其进化为完整的 SKILL.md。

## 模式格式

每个 Instinct 存储为 Markdown 文件，路径：

```
~/.opencode/instincts/{category}/{YYYY-MM-DD}_{slug}.md
```

或项目级：

```
{workspace}/.instincts/{category}/{slug}.md
```

### 完整格式

```markdown
---
name: 先规划后编码
category: workflow
confidence: 3
tags: [planning, workflow]
created: 2026-04-08
updated: 2026-04-08
origin: session_20260408
---

## 触发条件

当用户提出复杂需求，但没有明确的实现计划时。

## 模式内容

1. 先问清楚目标和约束
2. 分解为 3-5 个阶段
3. 识别每个阶段的依赖和风险
4. 获得用户确认后再开始

## 证据（Evidence）

- 2026-04-08：用户要求添加权限系统，拆分后识别出 3 个风险点
- 2026-04-07：规划 API 重构，提前发现循环依赖问题

## 示例（Examples）

用户："帮我加个用户模块"
→ 回答："先规划再动手可以吗？我想确认：需要哪些 API、权限怎么设计、要不要审计日志？"

## 反面案例（Anti-patterns）

- 直接开始写，做到一半发现架构不对 → 返工浪费大量时间
- 问太多细节，用户失去耐心 → 控制在 3 个关键问题内

## 置信度来源

- 3/5 = 2 次验证成功
- 需要更多场景验证才能升级
```

### 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | ✅ | 模式名称，简洁有力 |
| `category` | ✅ | 分类：workflow / code / security / tool / prompt / meta |
| `confidence` | ✅ | 1-5 置信度，5 = 经过充分验证 |
| `tags` | | 标签，便于检索 |
| `created` | ✅ | 创建日期 |
| `updated` | | 最后更新 |
| `origin` | | 来源：session_xxx 或 manual |

## 置信度评分规则

| 分数 | 含义 | 升级条件 |
|------|------|---------|
| 1 | 猜测，未验证 | 首次成功使用 |
| 2 | 单次成功 | 第 2 次成功 |
| 3 | 2-3 次验证 | 第 4 次成功 |
| 4 | 多次验证 | 跨 3 个不同项目验证 |
| 5 | 稳定模式，可进化为 Skill | 建议用 `/evolve` 转化为 SKILL.md |

每次使用成功后更新 `updated` 字段并追加证据。
连续失败 2 次则降级。

## 分类参考

| Category | 说明 | 示例 |
|----------|------|------|
| workflow | 工作流程和方法 | 先规划后编码 |
| code | 代码模式和风格 | 错误处理规范 |
| security | 安全最佳实践 | 凭证绝不硬编码 |
| tool | 工具使用技巧 | Playwright 调试技巧 |
| prompt | 提示词技巧 | 如何引导用户细化需求 |
| meta | 关于 AI 自身的模式 | 模型选择策略 |

## 核心命令

### /instinct-new {name} — 快速记录

```
用户：帮我加个用户模块
→ /instinct-new 复杂需求先规划

→ 自动打开编辑器，当前对话上下文已填入
→ 用户补充触发条件和证据后保存
```

### /instinct-list {category?} — 查看模式库

显示所有 Instinct，支持按分类/置信度/标签筛选。

### /instinct-search {query} — 检索

全文检索模式名称、内容、标签。

### /instinct-verify — 验证模式

运行假阳性检测：
1. 随机抽取 3 个 Instinct
2. 检查对应的证据是否仍然有效
3. 更新置信度，移除过时模式

### /evolve {category} — 进化为 Skill

将指定分类下高置信度（≥4）的 Instinct 聚类分析：
1. 找出同一领域的高置信度 Instinct
2. 去重、合并为统一的工作流
3. 生成 SKILL.md 草稿
4. 人工审核后保存到 skills 目录

### /instinct-import {file} — 导入

从 JSON/Markdown 文件批量导入 Instinct。
用于从他人或项目中迁移模式。

### /instinct-export — 导出

导出全部 Instinct 为 JSON，用于分享或备份。

## 存储结构

```
~/.opencode/
└── instincts/
    ├── workflow/
    │   ├── 2026-04-08_planning-before-coding.md
    │   └── 2026-04-09_compact-at-logical-breaks.md
    ├── security/
    │   └── 2026-04-07_no-hardcoded-secrets.md
    ├── code/
    │   └── 2026-04-06_error-handling-at-boundaries.md
    ├── tool/
    ├── prompt/
    └── meta/
```

项目级覆盖用户级：同名时项目级优先。

## EvoSkills 融合

Instinct System 是 EvoSkills Generator 的核心输入来源：

```
会话历史 → Instinct 提取 → 置信度验证 → Skill 进化
                ↓
         Surrogate Verifier
         独立验证模式有效性
```

每次成功的任务执行都是一次验证。
Instinct System 提供的是**真实使用反馈**，而非人工评判——
这正是 EvoSkills "协同进化" 的精髓。

## 使用时机

**立即记录**：
- 发现一个有效的沟通方式
- 找到一个反复遇到的问题的解法
- 学会了一个工具的某个技巧
- 纠正了自己之前的错误认知

**不要记录**：
- 还在探索阶段的猜测
- 只有一次验证的想法
- 太具体以至于不可复用

## 质量标准

- 每个 Instinct 必须有 **触发条件** + **模式内容** + **至少 1 个证据**
- 命名：动宾短语，≤10 字，如"规划后再动手"
- 不允许内容重复，相似 Instinct 合并
- 每月执行一次 `/instinct-verify` 清理
