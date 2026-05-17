---
name: openclaw-security-audit
description: |
  System security assessment, vulnerability scanning and risk detection.
metadata:
  openclaw:
    emoji: 🔒
  security:
    allowed_domains:
      - cve.mitre.org
      - nvd.nist.gov
---

# openclaw-security-audit

## Trigger Conditions

- User requests an OpenClaw security audit
- New OpenClaw configuration or plugin installation
- Routine security compliance check
- Post-deployment validation of security policies

## Usage

1. **Run full security assessment** of the OpenClaw environment:
   ```
   openclaw-security-audit run
   ```

2. **Check specific security policies**:
   ```
   openclaw-security-audit check-policy --name <policy-name>
   ```

3. **Scan for known vulnerabilities** in installed dependencies:
   ```
   openclaw-security-audit vuln-scan
   ```

4. **Generate compliance report**:
   ```
   openclaw-security-audit report --format <json|markdown> --output <file-path>
   ```

## Requirements

- No environment variables required
- File system access to OpenClaw configuration directory (`~/.openclaw/`)
- Read access to installed plugins and skill definitions
- Network access for vulnerability database queries (optional)
