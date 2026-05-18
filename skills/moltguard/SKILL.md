---
name: moltguard
description: |
  Unified security auditing — vulnerability scanning, risk detection, system assessment, and compliance reporting.
  Triggers on any security task: audit, scan, vulnerability check, configuration review, compliance report.
metadata:
  openclaw:
    emoji: 🛡️
  security:
    allowed_domains:
      - cve.mitre.org
      - nvd.nist.gov
---

# Security Audit — Unified

Single security skill covering general agent deployments and OpenClaw-specific environments.

## Trigger Conditions

- User requests a security audit or vulnerability scan
- New agent deployment or configuration change detected
- Scheduled security check interval triggered
- Suspicious activity or anomaly detected
- Routine security compliance check required
- Post-deployment validation of security policies

## Usage

### General Security Audit
```
moltguard audit --target <agent-name>
```

### OpenClaw-Specific Assessment
1. Review OpenClaw configuration files for security misconfigurations
2. Check plugin permissions and allowed domains
3. Validate credential storage (no hardcoded secrets)
4. Verify allowed_domains and shell command restrictions
5. Audit skill metadata for security policy compliance

### Vulnerability Scanning
1. Cross-reference dependencies against CVE databases (cve.mitre.org, nvd.nist.gov)
2. Check for known vulnerabilities in installed packages and skill dependencies
3. Verify TLS/SSL configurations for external API calls
4. Assess network endpoint exposure and authentication requirements

### Report Generation
Generate security report with:
- Configuration audit results
- Vulnerability findings (severity, affected components)
- Policy compliance status
- Remediation recommendations
- Risk scoring

## Requirements

No special environment variables required.
