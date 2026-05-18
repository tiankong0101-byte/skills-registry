---
name: cloud-handoff
description: 会话状态导出/导入系统。实现 OpenCode 与 OpenClaw（远程服务器）之间的无缝交接——本地开任务，推送至 OpenClaw 后台常驻执行，完成后结果拉回本地。源自 Cursor 3.0 Cloud Handoff 理念。
triggers:
  - 云交接
  - handoff
  - 会话导出
  - 会话迁移
  - 推送后台
features:
  - 会话状态序列化
  - OpenClaw推送
  - 结果拉回
  - 断点续传
dangerLevel: medium
---

# Cloud Handoff — 云端会话交接

> 来自 Cursor 3.0 Cloud Handoff 理念：让会话在本地与远程之间无缝移植。
> 本质是一个"会话快照"系统——导出状态 → 推送到 OpenClaw → 执行 → 拉回结果。

## 核心理念

- **本地开任务**：用 OpenCode 分析需求、制定计划
- **推送执行**：将会话状态推送到 OpenClaw Gateway（服务器）
- **远程执行**：OpenClaw 在后台持续运行，不占用本地算力
- **拉回结果**：OpenClaw 执行完毕后，将结果和状态同步回本地

```
本地 OpenCode ──Handoff──> OpenClaw Gateway（服务器）
                                   ↓
                             后台持续执行
                                   ↓
本地 OpenCode <──Pull────── 结果推送通知
```

## 适用场景

- 耗时长的任务（大型重构、数据处理）
- 需要持续运行的任务（监控、爬虫、定时任务）
- 跨设备协作（本地写代码，服务器跑测试）
- 离线场景（关掉电脑，OpenClaw 继续跑）

## 会话快照格式（handoff.json）

```json
{
  "version": "1.0",
  "timestamp": "2026-04-08T12:00:00Z",
  "source": "opencode",
  "task": {
    "title": "重构用户模块",
    "description": "...",
    "context_files": ["src/user/*.ts"],
    "instructions": "详细的执行指令..."
  },
  "state": {
    "completed_steps": ["分析需求", "制定计划"],
    "pending_steps": ["编写代码", "运行测试"],
    "artifacts": {
      "plan": "## 计划内容..."
    }
  },
  "callback": {
    "method": "telegram",
    "chat_id": "..."
  }
}
```

## 核心命令

### /handoff-push {任务描述}

导出当前会话状态并推送到 OpenClaw。

**流程**：
1. 序列化当前会话状态为 `handoff.json`
2. 打包相关文件（代码、配置、上下文）
3. 通过 OpenClaw API 上传到服务器
4. 触发 OpenClaw 中的执行 Agent
5. 返回执行会话 ID，告知如何追踪

**输出**：
```
[Cloud Handoff] 会话已推送
  任务ID: handoff_20260408_abc123
  追踪方式: /handoff-status handoff_20260408_abc123
  完成后通知: Telegram
```

### /handoff-pull {task-id}

拉回执行结果。

**流程**：
1. 查询 OpenClaw 中该任务的状态
2. 如果完成：下载结果（修改的文件、输出日志）
3. 合并到本地工作区
4. 展示结果摘要

**输出**：
```
[Cloud Handoff] 结果已拉回
  任务: 重构用户模块
  状态: ✅ 完成
  修改文件: src/user/auth.ts, src/user/model.ts
  新增测试: src/user/auth.test.ts
```

### /handoff-status {task-id}

查询任务执行状态（pending / running / done / failed）。

### /handoff-abort {task-id}

中止正在执行的任务。

---

## OpenClaw 端实现

在 OpenClaw 侧需要：

1. **Handoff Receiver**：接收 API 请求，创建 Handoff Agent
2. **Persistent Execution**：不因 Gateway 重启而中断
3. **Progress Notification**：实时推送进度到指定渠道
4. **Result Storage**：结果持久化存储，支持拉回

```
OpenClaw 工作区:
~/.openclaw/workspace/handoffs/
├── handoff_20260408_abc123/
│   ├── handoff.json        # 原始任务
│   ├── state.json         # 执行状态
│   ├── artifacts/         # 产物
│   └── logs/             # 执行日志
```

---

## 通知配置

### Telegram 通知

在 `openclaw.json` 中配置：
```json
{
  "handoff": {
    "notify_on_complete": true,
    "notify_method": "telegram",
    "telegram_chat_id": "YOUR_CHAT_ID"
  }
}
```

### Webhook 通知

```json
{
  "handoff": {
    "webhook_url": "https://your-webhook.com/notify",
    "webhook_events": ["complete", "failed", "blocked"]
  }
}
```

---

## 安全边界

- 推送前需要用户确认任务内容和涉及的文件范围
- 敏感文件（.env、credentials）需要显式授权才能打包
- OpenClaw 端执行权限受 `exec-approvals.json` 约束
- 结果文件超过 10MB 时分块拉回

## 与 OpenCode 的集成

OpenCode 通过 OpenClaw MCP 工具调用 Handoff API：

```
OpenCode  →  MCP: openclaw.handoff_push()  →  OpenClaw Gateway
OpenCode  →  MCP: openclaw.handoff_pull()  ←  OpenClaw Gateway
```
