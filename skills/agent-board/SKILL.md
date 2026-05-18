---
name: agent-board
description: 多 Agent 并行任务看板。源自 Cursor 3.0 Agent Window，将所有进行中的 Agent 任务以并排/网格视图展示，实时显示每个 Agent 的状态、进度和输出。增强 agent-team-orchestration。
triggers:
  - agent看板
  - 并行任务
  - agent监控
  - 多任务视图
  - agent状态
features:
  - 并行任务看板
  - 实时状态追踪
  - 网格视图
  - 任务聚合
dangerLevel: low
---

# Agent Board — 多 Agent 并行任务看板

> 来自 Cursor 3.0 Agents Window 的核心灵感：将 IDE 变成 Agent 任务控制台。
> 所有 Agent 任务以独立工位形式平铺，状态一目了然。

## 核心理念

```
传统视图：  任务1 → 任务2 → 任务3（串行，线性）
Board视图： [Agent 1] [Agent 2] [Agent 3]（并行，工位化）
```

每个 Agent 是一个工位，显示：状态 / 进度 / 输出 / 剩余工作量。

## 看板视图

运行 `/board` 时，展示如下：

```
╔══════════════════════════════════════════════════════════════╗
║                    AGENT BOARD  —  4 个任务并行                  ║
╠══════════════════════════════════════════════════════════════╣
║ 🟢 research-1    🔵 frontend-dev    🟡 code-review   🔴 build-fix ║
║ ───────────────   ─────────────────   ───────────────   ──────────║
║ 状态: ✅ 完成       状态: 🔄 进行中     状态: ⏳ 等待       状态: ⏸ 暂停  ║
║ 进度: 100%         进度: ████░░ 60%   进度: 0%           进度: ██░░░ 20%║
║ 用时: 4分 12秒      用时: 7分 33秒       -                  用时: 2分       ║
║                       预计剩余: 5分                            等待: 依赖前置  ║
╠══════════════════════════════════════════════════════════════╣
║ 最近输出:                                                        ║
║  research-1 → 找到12篇相关文章，过滤去重后保留7篇                  ║
║  frontend → 正在编写 src/components/UserPanel.tsx              ║
╚══════════════════════════════════════════════════════════════╝
```

## 任务状态定义

| 状态 | 符号 | 说明 |
|------|------|------|
| pending | ⏳ | 已创建，等待执行 |
| running | 🔄 | 执行中 |
| blocked | 🔒 | 等待前置依赖 |
| paused | ⏸ | 手动暂停 |
| done | ✅ | 已完成 |
| failed | 🔴 | 执行失败 |
| cancelled | ⚫ | 已取消 |

## 核心命令

### /board

显示所有 Agent 任务的看板视图。

**输出**：网格/并排视图，实时显示每个任务的状态。

### /board-launch {任务描述} -n {数量}

并行启动 N 个 Agent 任务。

```
/board-launch "搜索 AI 新闻" -n 3
→ [Agent-1] 搜索中文媒体
→ [Agent-2] 搜索英文媒体
→ [Agent-3] 搜索技术博客
→ [聚合] 合并去重 → 最终报告
```

**关键设计**：主任务负责聚合，N 个子任务并行执行。

### /board-assign {task-id} -agent {agent-type}

将待处理任务分配给指定类型的 Agent。

### /board-block {task-id}

标记任务为 blocked（等待依赖）。

### /board-unblock {task-id}

解除阻塞，继续执行。

### /board-kill {task-id}

强制终止 Agent 任务。

### /board-clean

清理已完成的任务（保留最近 10 条历史）。

---

## Agent 类型参考

| Agent | 任务类型 |
|-------|---------|
| researcher | 搜索、调研、资料收集 |
| writer | 文章撰写、内容生成 |
| coder | 代码编写、功能实现 |
| reviewer | 代码审查、安全审计 |
| tester | 测试编写、验证 |
| builder | 构建、部署、运维 |
| doc-writer | 文档撰写 |

---

## 视图模式

### /board --grid

网格视图（2×N 布局，适合大屏）。

### /board --compact

紧凑视图（单行滚动，适合终端）。

### /board --focus {task-id}

聚焦单个任务，显示详细日志流。

---

## 数据结构

```json
{
  "board_id": "board_20260408",
  "tasks": [
    {
      "task_id": "task_001",
      "name": "搜索 AI 新闻",
      "agent_type": "researcher",
      "status": "running",
      "progress": 0.6,
      "created_at": "2026-04-08T08:00:00Z",
      "started_at": "2026-04-08T08:00:05Z",
      "estimated_remaining": "5min",
      "output_summary": "正在搜索中文媒体...",
      "depends_on": [],
      "artifacts": ["search_results.json"]
    }
  ]
}
```

## 调度策略

### 并行度控制

- 默认最多 3 个 Agent 并行运行
- 超过 3 个时排队等待
- 用户可手动指定：`/board-launch -n 5`

### 依赖管理

- 显式依赖：`depends_on: [task_id]`
- 自动依赖识别：如果任务 B 需要任务 A 的输出，则 B blocked 直到 A 完成

### 失败处理

- 单个 Agent 失败不影响其他并行任务
- 失败任务可手动重试：`/board-retry {task-id}`
- 主任务失败时询问用户：是重试 / 跳过 / 中止

## agent-team-orchestration 集成

agent-board 是 agent-team-orchestration 的可视化层：

```
agent-team-orchestration         agent-board
┌─────────────────────────┐    ┌─────────────────────────┐
│ • 定义团队结构           │    │ • 任务状态可视化         │
│ • 角色协议               │ ←→ │ • 并行进度监控           │
│ • 交接流程               │    │ • 网格/并排视图          │
│ • 依赖管理               │    │ • 结果聚合看板           │
└─────────────────────────┘    └─────────────────────────┘
```

**共享同一份任务状态**，agent-team-orchestration 负责逻辑，agent-board 负责呈现。

### 组合命令

```
/team-launch {任务}     → agent-team-orchestration: 创建团队
                         → agent-board: 启动看板视图

/board-launch {任务}   → agent-board: 启动并行任务
                         → agent-team-orchestration: 注册到团队

/board-kill {task-id}  → agent-board: 终止任务
                         → agent-team-orchestration: 更新团队状态
```

### 数据流

```
用户输入
    ↓
agent-team-orchestration（逻辑层）
  ├─ 创建团队配置
  ├─ 分解任务
  └─ 管理交接协议
    ↓
agent-board（呈现层）
  ├─ 展示任务工位
  ├─ 实时状态更新
  └─ 聚合最终结果
```
