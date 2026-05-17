---
name: skillhub-preference
description: |
  Skill preference management and personalized skill recommendations.
metadata:
  openclaw:
    emoji: ⭐
  security:
    allowed_domains: []
---

# skillhub-preference

## Trigger Conditions

- User wants to configure skill preferences or favorites
- Skill recommendation requested based on usage patterns
- Personalizing the skill discovery experience
- Managing skill categories and priority ordering

## Usage

1. **Set skill preference** (favorite, pin, or hide):
   ```
   skillhub-preference set --name <skill-name> --preference <favorite|pinned|hidden>
   ```

2. **Get personalized recommendations**:
   ```
   skillhub-preference recommend --context "<task-description>"
   ```

3. **List preferred skills**:
   ```
   skillhub-preference list --filter <favorite|pinned|all>
   ```

4. **Reset preferences** to defaults:
   ```
   skillhub-preference reset
   ```

## Requirements

- No environment variables required
- Write access to preferences storage (`~/.config/opencode/preferences/`)
- Read access to skill registry for recommendation generation
- Usage tracking data (opt-in) for improved recommendations
