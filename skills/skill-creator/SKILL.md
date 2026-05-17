---
name: skill-creator
description: |
  Create and scaffold new skills with proper structure and metadata.
metadata:
  openclaw:
    emoji: 🏗️
  security:
    allowed_domains: []
---

# skill-creator

## Trigger Conditions

- User wants to develop a new skill from scratch
- Scaffolding a skill directory structure with required files
- Generating metadata and configuration for a new skill
- Validating skill structure against registry standards

## Usage

1. **Scaffold a new skill**:
   ```
   skill-creator scaffold --name <skill-name> --description "<description>" --emoji <emoji>
   ```

2. **Add a trigger condition** to an existing skill:
   ```
   skill-creator add-trigger --name <skill-name> --condition "<trigger-text>"
   ```

3. **Generate skill metadata**:
   ```
   skill-creator generate-meta --name <skill-name>
   ```

4. **Validate skill structure**:
   ```
   skill-creator validate --path <skill-path>
   ```

## Requirements

- No environment variables required
- Write access to skills directory (e.g., `~/.config/opencode/skills/`)
- Template files for SKILL.md scaffolding
- Read access to existing skills for pattern reference
