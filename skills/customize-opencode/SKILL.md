---
name: customize-opencode
description: |
  OpenCode configuration management.
metadata:
  openclaw:
    emoji: ⚙️
  security:
    allowed_domains: []
---

# customize-opencode

## Trigger Conditions

- User edits `opencode.json`, `opencode.jsonc`, or `.opencode/` files
- User modifies `AGENTS.md` or agent/subagent definitions
- Creating or editing OpenCode skills, plugins, or MCP servers
- Configuring permission rules or environment settings
- Any task where the primary goal is OpenCode itself configuration

## Usage

1. **Edit OpenCode configuration**:
   ```
   customize-opencode edit-config --file opencode.jsonc
   ```

2. **Register a new skill** in the skill registry:
   ```
   customize-opencode register-skill --name <skill-name> --path <skill-path>
   ```

3. **Configure an MCP server**:
   ```
   customize-opencode add-mcp --name <server-name> --command <cmd> --args <args>
   ```

4. **Set up permission rules**:
   ```
   customize-opencode set-permission --tool <tool-name> --allow <true|false>
   ```

5. **Create or update AGENTS.md**:
   ```
   customize-opencode edit-agents
   ```

## Requirements

- No environment variables required
- Write access to `~/.config/opencode/` directory
- Read access to existing configuration files for validation
- Schema validation support for `opencode.jsonc`
