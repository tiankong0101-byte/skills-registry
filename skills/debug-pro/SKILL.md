---
name: debug-pro
description: |
  Code quality review, issue diagnosis, bug fixing and result verification.
metadata:
  openclaw:
    emoji: 🐛
  security: {}
---

# debug-pro

Code quality review and bug fixing skill. Use when diagnosing runtime errors, reviewing code quality, or verifying fixes.

## Trigger Conditions

- Bug reports and crash logs are presented
- Code review requests with suspected defects
- Quality issues such as lint errors, type errors, test failures
- After implementing a fix that needs verification

## Usage

1. Reproduce the issue — get exact error messages, stack traces, or unexpected behavior
2. Inspect the relevant source code and trace the root cause
3. Apply the minimal fix needed, avoiding scope creep
4. Verify the fix by running tests, linting, and type-checking
5. Summarize what went wrong and how it was resolved

## Requirements

No special environment variables required.
