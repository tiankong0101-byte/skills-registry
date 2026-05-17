---
name: debug-session
description: |
  Structured debugging sessions with root cause analysis.
metadata:
  openclaw:
    emoji: 🔍
  security: {}
---

# debug-session

Structured debugging sessions for complex bugs. Use when a bug requires systematic investigation beyond simple inspection.

## Trigger Conditions

- Complex, multi-step bugs that are hard to reproduce
- Intermittent or race-condition issues
- Crashes or memory-related problems
- Bugs spanning multiple components or layers

## Usage

1. Gather all evidence — logs, stack traces, reproduction steps, environment details
2. Formulate hypotheses about the root cause
3. Test each hypothesis with targeted experiments (add logging, inspect state, isolate variables)
4. Identify the definitive root cause
5. Implement the fix and add regression coverage
6. Document findings for future reference

## Requirements

No special environment variables required.
