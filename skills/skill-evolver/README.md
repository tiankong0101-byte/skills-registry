# Skill Evolver Framework

基于 **EvoSkills (2604.01687)** 和 **EvoSkill (2603.02766)** 论文核心思路实现。

## 核心架构

```
Skill Generator ──(累积反馈)── Surrogate Verifier
     ↑                               │
     │                    (隔离LLM会话·避免确认偏误)
     │                               ↓
     └────── Pareto Frontier ← 通过/拒绝 ← 进化循环
```

## 四大模块

| 模块 | 论文来源 | 功能 |
|------|---------|------|
| **Surrogate Verifier** | EvoSkills | 信息隔离的独立验证器 |
| **Skill Generator** | EvoSkills | 累积反馈驱动的技能迭代 |
| **Pareto Frontier** | EvoSkill | 多版本竞争·Pareto最优选择 |
| **Failure Discoverer** | EvoSkill | 三智能体·失败驱动技能发现 |
| **Cross-Model Tester** | 论文共推 | 跨模型泛化能力验证 |

## 快速开始

```bash
cd skills/skill-evolver

# 初始化某个Skill的eval断言
node src/cli.js init-evals skill-creator

# 验证某个Skill
node src/cli.js verify skill-creative

# 进化某个Skill（最多5轮）
node src/cli.js evolve skill-creative --rounds 5

# 批量验证所有Skills
node src/cli.js verify-all --parallel 4

# 查看进化状态
node src/cli.js status --skill skill-creator

# 从失败中学习（发现新Skill）
node src/cli.js discover

# 跨模型测试
node src/cli.js cross-test skill-creator --models gpt-4o,claude-sonnet-4
```

## 文件结构

```
skill-evolver/
├── SKILL.md                    # 本文件
├── src/
│   ├── index.js               # 核心引擎
│   ├── cli.js                 # CLI入口
│   ├── llm-client.js          # LLM抽象层
│   ├── surrogate-verifier.js   # 隔离验证器
│   ├── skill-generator.js     # 技能生成器
│   ├── assertion-engine.js    # 断言引擎
│   ├── evolution-loop.js      # 进化循环
│   ├── pareto-frontier.js     # Pareto前沿
│   ├── rollback.js            # 回滚管理
│   ├── failure-discoverer.js  # 失败发现
│   ├── skill-builder.js       # Skill构建
│   ├── cross-model-tester.js  # 跨模型测试
│   └── status-reporter.js     # 状态报告
├── evals/                     # 各Skill的eval断言
│   ├── skill-creator/evals.json
│   ├── systematic-debugging/evals.json
│   └── ...
├── memory/                    # 进化记忆
│   └── {skill}-memory.json
├── .evolve/                   # 版本与Pareto数据
│   └── {skill}/
│       ├── pareto-frontier.json
│       └── checkpoints/
├── batch-gen-evals/           # 批量生成脚本
└── .env                       # 环境配置
```

## 迁移指南

### 已有 evals.json 的 Skill
直接在 `evals/{skill-name}/evals.json` 创建文件即可被框架识别。

### 已有独立 evals 的 Skill（如 abm-ad-creative）
```bash
# 把现有 evals 迁移到标准位置
cp ~/.openclaw/skills/abm-ad-creative/evals/evals.json \
   skill-evolver/evals/abm-ad-creative/evals.json
```

### 生成新 Skill 的 evals
```bash
node src/cli.js init-evals new-skill-name
# 或批量生成
node ../batch-gen-evals/batch-gen-evals.js
```

## 环境变量

| 变量 | 默认 | 说明 |
|------|------|------|
| `EVOLVER_LLM_MODEL` | qwen/qwen2.5-coder-7b-instruct | 进化模型 |
| `EVOLVER_VERIFIER_MODEL` | 同上 | 验证器模型 |
| `EVOLVER_MAX_ROUNDS` | 5 | 最大进化轮次 |
| `EVOLVER_PASS_THRESHOLD` | 0.8 | 通过率阈值 |
| `EVOLVER_REVIEW_MODE` | false | 人工审核 |
| `EVOLVER_ROLLBACK_MODE` | hard | 回滚策略 |
| `EVOLVER_NVIDIA_API_KEY` | (自动读取) | NVIDIA NIM Key |
