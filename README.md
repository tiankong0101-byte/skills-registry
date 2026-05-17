# 菲菲技能仓库 / Fei Skills Registry

集中管理所有 agent 技能，通过 skill-syncer 自动分发到：
- OpenCode: `~/.config/opencode/skills/`
- iFlow CLI: `~/skills/`
- iFlow-bot: `~/.iflow-bot/workspace/skills/`
- OpenClaw: `~/.openclaw/workspace/skills/`

## 结构

```
skills-registry/
├── README.md
├── skills/           ← 技能目录（唯一源头）
│   ├── agent-autopilot/
│   ├── agent-browser/
│   ├── ...
│   └── ytdlp-transcript/
└── .gitignore
```

## 使用

```bash
# 克隆
git clone https://github.com/tiankong0101-byte/skills-registry.git

# 更新所有技能
git pull

# 同步到 agent 目录
# skill-syncer 自动完成
```
