---
name: soul-companion
description: |
  AI personality and role-playing configuration management.
metadata:
  openclaw:
    emoji: 💝
  security:
    allowed_domains: []
---

# soul-companion

## Trigger Conditions

- User wants to set up or modify an AI persona
- Defining character traits, backstory, or behavior rules
- Configuring role-playing parameters for agent interactions
- Loading or switching between multiple personality profiles

## Usage

1. **Create a new persona**:
   ```
   soul-companion create --name <persona-name> --template <template-file>
   ```

2. **Edit persona traits and behavior**:
   ```
   soul-companion edit --name <persona-name>
   ```

3. **List available personas**:
   ```
   soul-companion list
   ```

4. **Activate a persona** for current session:
   ```
   soul-companion activate --name <persona-name>
   ```

5. **Export persona configuration**:
   ```
   soul-companion export --name <persona-name> --output <file-path>
   ```

## Requirements

- No environment variables required
- Write access to persona storage (`~/.config/opencode/personas/`)
- Template files for persona definitions (YAML/JSON format)
