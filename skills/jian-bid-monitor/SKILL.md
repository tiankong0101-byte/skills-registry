---
name: jian-bid-monitor
description: |
  监控吉安市工程招标公告（仅吉安市）。每小时自动检查新公告，重点优先推送（预招标>需求征集>设备采购>其他）。
  触发词：吉安招标、监控吉安招标、吉安市政工程招标
  当用户需要获取吉安市最新招标公告时使用。
---

# 吉安工程招标监控

## 定时任务（已配置）

| 任务名 | 频率 | 功能 |
|--------|------|------|
| JianBidMonitor_Hourly | 每小时 | 检查新公告、更新日志 |
| JianBidMonitor_Summary | 每6小时 | 生成摘要报告到桌面 |

## 运行脚本

```bash
# 每小时检查（自动通过定时任务运行）
node C:\Users\TIAN\.config\opencode\skills\jian-bid-monitor\scripts\monitor.js --check

# 每6小时摘要报告（自动通过定时任务运行）
node C:\Users\TIAN\.config\opencode\skills\jian-bid-monitor\scripts\monitor.js --summary

# 手动同步到 Tabbit（每次新公告自动触发，无需手动运行）
node C:\Users\TIAN\.config\opencode\skills\jian-bid-monitor\scripts\sync_to_tabbit.js
```

## Tabbit 收藏夹同步

`monitor.js --check` 发现新公告时会**自动同步到 Tabbit 收藏夹**：

- 同步目标：`Tabbit` 书签栏 → **吉安招标** 文件夹
- 同步内容：标题、链接、优先级（预招标/需求征集/设备采购/普通）
- 摘要信息：来源 | 日期 | 优先级标注
- 去重机制：基于公告 ID 同步，同一条公告不会重复出现
- 每次最多同步 50 条最新重点公告

打开 Tabbit 浏览器 → 书签栏 → **吉安招标** 文件夹，可直接查看所有监控中的招标公告。

## 数据源

- 吉安市·建设工程：ggzy.jian.gov.cn（静态页）
- 江西省·吉安市：ggzy.jiangxi.gov.cn（仅吉安地区）

## 公告优先级

1. **【预招标】** — 预招标公告
2. **【需求征集】** — 采购需求征集、意向公开、需求公示
3. **【设备采购】** — 设备/仪器/器械/机械采购
4. **其他公告**

## 数据管理

- 日志文件：`~/.agent-reach/jian-bid-log.json`（含完整公告数据+时间戳）
- 桌面报告：`Desktop/吉安招标监控_YYYYMMDD.md`
- **自动清理**：超过3个月的记录自动删除
- **去重**：基于公告ID去重，不重复推送

## 管理命令

```powershell
# 查看任务状态
schtasks /query /tn "JianBidMonitor_Hourly" /fo LIST
schtasks /query /tn "JianBidMonitor_Summary" /fo LIST

# 手动运行
schtasks /run /tn "JianBidMonitor_Hourly"
schtasks /run /tn "JianBidMonitor_Summary"

# 删除任务
schtasks /delete /tn "JianBidMonitor_Hourly" /f
schtasks /delete /tn "JianBidMonitor_Summary" /f
```

## Step 2：Tabbit 标签页 + AI 内容分析（已验证可用）

> 📅 **正则修复（2026-05-07）：** `dateBeforeFront` 支持"2026年05月06日 09点00分 （北京时间）前递交投标文件"格式。
> - `S` 字符类新增全角符号：`）\uff09`，`，\uff0c`，`．\uff0e`，`、`u3001`，`。\u3002`
> - `dateBeforeFront` 分隔符从 `S{0,3}` 改为 `[^\d]{0,60}`，允许日期到"前递交"间有任意60个非数字字符

```bash
# 启动 Tabbit 标签页分析流程
node C:\Users\TIAN\.config\opencode\skills\jian-bid-monitor\scripts\ai_analysis.js
```

**工作流程：**
1. 连接 Tabbit CDP（端口 9222，session: jian-bid）
2. 从 `jian-bid-log.json` 筛选重点公告（优先级 1-3，未处理过）
3. 逐条用 `agent-browser tab new <url>` 打开新标签
4. 等待页面加载后用 `agent-browser eval` 提取页面正文（前3000字）
5. 正则解析结构化字段：金额/截止日期/采购方式/工期/资质/联系人
6. 输出 AI 分析报告到终端
7. 状态持久化到 `~/.agent-reach/jian-bid-tabbed.json`

**agent-browser 关键命令（已验证）：**
```bash
agent-browser --cdp 9222 --session jian-bid tab list --json   # JSON格式列出标签
agent-browser --cdp 9222 --session jian-bid tab new <url>      # 打开新标签
agent-browser --cdp 9222 --session jian-bid eval "document.body.innerText.slice(0,3000)"  # 提取正文
```

**注意事项：**
- Tabbit 需启动并开启远程调试（端口 9222）
- 每次最多分析 8 条（防止标签页过多）
- 截止日期提取：支持 keyword-before-date（投标截止/开标时间/递交截止等）和 date-before-keyword（"2026年05月06日...前递交投标文件"）两种语序
- `ai_analysis.js` 已通过端到端测试（2026-05-07）
