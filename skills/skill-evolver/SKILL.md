---
name: skill-evolver
description: "Skill Self-Verification & Auto-Evolution Framework. 实现 EvoSkills/EvoSkill 论文核心思路：Surrogate Verifier 隔离验证、Pareto 前沿多版本进化、失败驱动的 Skill 发现、跨模型迁移测试。触发词：/evolve, /verify, 进化技能, 技能自验证, skill evolution, run evals"
version: 1.0.0
tags: [meta, evolution, self-improvement, core, evals, auto-evolve]
permissions: [network, shell, read, write]
allowed-tools: Bash(node *), Read(*), Write(*), Glob(*), Grep(*)
---

# Skill Evolver - 自进化技能框架

基于 EvoSkills (2604.01687) & EvoSkill (2603.02766) 论文核心思路实现。

## 核心架构

```
Skill Generator (生成器) ←→  累积反馈上下文  ←→  历史版本
       ↓                                    ↑
  候选版本 ──→ Surrogate Verifier ──→ 验证结果
                  (隔离LLM会话)              ↓
                                       接受/拒绝/回滚
```

## 三大核心机制

### P0: Surrogate Verification（隔离验证）
- Skill Generator 与 Surrogate Verifier **信息隔离**
- Verifier 在独立 LLM 会话中生成测试断言
- 避免自我验证的确认偏误

### P1: Pareto Frontier（多版本竞争）
- 每个 Skill 维护多个候选版本
- 通过 Pareto 最优选择保留最佳策略
- 避免单一路径的局部最优

### P2: Failure-Driven Discovery（失败驱动发现）
- Executor → Proposer → SkillBuilder 三智能体流水线
- 从失败中自动发现新 Skill
- 历史反馈避免重复提案

### P3: Cross-Model Testing（跨模型迁移）
- 同一 Skill 在不同模型上评测
- 验证 Skill 的模型无关性（通用性）
- 淘汰模型强依赖的 Skill

## 命令

```bash
# 进化指定 Skill
node src/index.js evolve <skill-name> [--rounds 5] [--review]

# 验证指定 Skill
node src/index.js verify <skill-name> [--eval-id 1]

# 验证所有 Skills
node src/index.js verify-all [--parallel 4]

# 列出进化状态
node src/index.js status [--skill <name>]

# 查看 Pareto 前沿
node src/index.js pareto [--skill <name>]

# 从失败中学习（发现新 Skill）
node src/index.js discover [--from-failures] [--skill <name>]

# 跨模型测试
node src/index.js cross-test [--skill <name>] [--models gpt-4o,claude-sonnet-4,gemini-2]

# 回滚到指定版本
node src/index.js rollback <skill-name> [--version v1.2.3]
```

## 配置（环境变量）

| 变量 | 默认 | 说明 |
|------|------|------|
| `EVOLVER_LLM_MODEL` | `qwen/qwen2.5-coder-7b-instruct` | 进化用模型 |
| `EVOLVER_VERIFIER_MODEL` | 同上 | 验证器用模型（可不同） |
| `EVOLVER_MAX_ROUNDS` | `5` | 最大进化轮次 |
| `EVOLVER_PASS_THRESHOLD` | `0.8` | 通过率阈值 |
| `EVOLVER_REVIEW_MODE` | `false` | 人工审核模式 |
| `EVOLVER_ROLLBACK_MODE` | `hard` | 回滚策略：hard/stash/none |
| `EVOLVER_NVIDIA_BASE_URL` | `https://integrate.api.nvidia.com/v1` | NVIDIA NIM |
| `EVOLVER_NVIDIA_API_KEY` | (读取 NVIDIA NIM API Key) | API Key |
| `EVOLVER_EVALS_DIR` | `./evals` | Eval 文件目录 |
| `EVOLVER_MEMORY_DIR` | `./memory` | 记忆文件目录 |
| `EVOLVER_EVOLVE_DIR` | `./.evolve` | 进化版本目录 |

## 进化流程

1. **加载 Skill**：读取目标 SKILL.md
2. **生成候选**：Skill Generator 根据历史反馈生成改进版本
3. **隔离验证**：Surrogate Verifier 在独立会话中跑 eval 断言
4. **Pareto 选择**：Pareto 前沿决定保留或淘汰
5. **接受/回滚**：通过阈值则接受，否则回滚
6. **迭代**：重复直到通过率达标或达到最大轮次

## Eval Schema

每个 Skill 的 evals 目录存放 `evals.json`：

```json
{
  "skill_name": "xxx",
  "evals": [
    {
      "id": 1,
      "prompt": "测试输入",
      "expected_output": "期望行为描述",
      "assertions": ["断言1", "断言2"],
      "files": ["支持文件列表"]
    }
  ]
}
```
