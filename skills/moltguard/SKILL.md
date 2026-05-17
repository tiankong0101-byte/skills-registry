---
name: moltguard
description: |
  Security auditing and system protection for agent deployments.
metadata:
  openclaw:
    emoji: 🛡️
  security:
    allowed_domains: []
---

# moltguard

## Trigger Conditions

- User requests a security audit or vulnerability scan
- New agent deployment or configuration change detected
- Scheduled security check interval triggered
- Suspicious activity or anomaly detected in agent behavior

## Usage

1. **Run a security audit** on an agent or deployment:
   ```
   moltguard audit --target <agent-name>
   ```

2. **Scan for vulnerabilities** in dependencies and configurations:
   ```
   moltguard scan --path <project-path>
   ```

3. **Generate a security report**:
   ```
   moltguard report --output <file-path>
   ```

4. **Monitor agent behavior** for anomalies:
   ```
   moltguard monitor --agent <agent-name>
   ```

## Requirements

- No environment variables required
- Network access for CVE database lookups (optional)
- Read access to target agent configurations and dependencies
