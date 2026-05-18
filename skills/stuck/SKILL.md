---
name: stuck
description: 诊断冻结/卡住/缓慢的会话，并生成诊断报告
allowed-tools:
  - Read
  - Bash(ps:*)
  - Bash(pgrep:*)
  - Bash(sample:*)
when_to_use: 当用户认为当前机器上的另一个会话冻结、卡住或非常慢时使用。触发词："卡住了"、"很慢"、"没响应"、"stuck"、"冻结"
---

# 会话卡死诊断器

用户认为此机器上的另一个会话冻结、卡住或非常慢。调查并发布诊断报告。

## 目标
识别卡住的会话进程，诊断原因，提供解决方案。

## 步骤

### 1. 列出所有相关进程

**Windows系统**:
```powershell
Get-Process | Where-Object { $_.ProcessName -match 'claude|node|python' } | Select-Object Id, ProcessName, CPU, WorkingSet, StartTime
```

**macOS/Linux**:
```bash
ps -axo pid=,pcpu=,rss=,etime=,state=,comm=,command= | grep -E '(claude|cli)' | grep -v grep
```

过滤到 `comm` 为 `claude` 或（`cli` 且命令路径包含"claude"）的行。

**成功标准**: 已列出所有相关进程

### 2. 识别可疑进程

查找以下卡住会话的迹象：

- **高CPU（≥90%）持续** — 可能是无限循环。采样两次，间隔1-2秒，确认不是瞬时峰值。
- **进程状态 `D`（不可中断睡眠）** — 通常是I/O挂起。`ps` 输出中的 `state` 列；第一个字符重要（忽略 `+`、`s`、`<` 等修饰符）。
- **进程状态 `T`（停止）** — 用户可能意外按了 Ctrl+Z。
- **进程状态 `Z`（僵尸）** — 父进程没有回收。
- **非常高RSS（≥4GB）** — 可能内存泄漏导致会话迟缓。
- **卡住的子进程** — 挂起的 `git`、`node` 或shell子进程可能冻结父进程。

**Windows特定检查**:
```powershell
# 检查进程详细信息
Get-WmiObject Win32_Process | Where-Object { $_.Name -match 'claude|node' } | Select-Object ProcessId, Name, CommandLine, WorkingSetSize

# 检查进程线程
Get-Process -Id <pid> | Select-Object -ExpandProperty Threads
```

**成功标准**: 已识别可疑进程及其状态

### 3. 收集更多上下文

对于任何可疑内容，收集更多上下文：
- 子进程: 查找子进程列表
- 如果高CPU：1-2秒后再次采样确认是持续的
- 如果子进程看起来挂起（如git命令），注意其完整命令行
- 检查会话调试日志（如果能推断会话ID）: `~/.claude/debug/<session-id>.txt`（最后几百行通常显示挂起前在做什么）

**成功标准**: 已收集详细诊断信息

### 4. 生成诊断报告

格式化报告包含：
- PID、CPU%、RSS、状态、运行时间、命令行、子进程
- 对可能错误的诊断
- 相关调试日志尾部或采样输出

**成功标准**: 已生成完整诊断报告

### 5. 提供解决方案

根据诊断结果提供建议：

| 问题类型 | 建议解决方案 |
|---------|-------------|
| 高CPU无限循环 | 终止进程，检查代码逻辑 |
| I/O挂起 (D状态) | 等待或终止进程，检查磁盘/网络 |
| 停止状态 (T) | 使用 `fg` 恢复或终止 |
| 僵尸进程 (Z) | 终止父进程 |
| 内存泄漏 | 终止进程，报告问题 |
| 子进程卡住 | 终止子进程，可能需要终止父进程 |

**成功标准**: 用户已知晓解决方案

## 规则
- 不要杀死或发送信号给任何进程 — 仅诊断
- 如果用户给了参数（如特定PID或症状），优先关注那里
- 如果每个会话看起来健康，直接告诉用户 — 不发布"全部正常"
