---
name: skill-vetter
description: |
  Skill quality review, source code audit and safety verification.
metadata:
  openclaw:
    emoji: 🕵️
  security:
    allowed_domains: []
---

# skill-vetter

## Trigger Conditions

- User requests a skill quality review or safety check
- New skill submitted for inclusion in the registry
- Pre-installation validation of a third-party skill
- Periodic audit of installed skills for compliance

## Usage

1. **Review a skill for quality and safety**:
   ```
   skill-vetter review --path <skill-path>
   ```

2. **Audit source code** for security issues:
   ```
   skill-vetter audit --path <skill-path> --depth <basic|deep>
   ```

3. **Check skill metadata completeness**:
   ```
   skill-vetter check-meta --path <skill-path>
   ```

4. **Generate a vetting report**:
   ```
   skill-vetter report --path <skill-path> --output <file-path>
   ```

## Requirements

- No environment variables required
- Read access to skill directory and source files
- Write access for report output
- Static analysis tools for code auditing (e.g., regex pattern matching, dependency checking)
