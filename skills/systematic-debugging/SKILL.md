---
name: systematic-debugging
description: |
  Structured debugging methodology with step-by-step analysis and root cause investigation.
metadata:
  openclaw:
    emoji: 📋
  security: {}
---

# systematic-debugging

Methodical debugging methodology for hard-to-reproduce issues. Use when casual inspection fails and a rigorous approach is needed.

## Trigger Conditions

- Complex, multi-step bugs that are hard to reproduce
- Intermittent, race-condition, or non-deterministic issues
- Crashes, memory-related problems, or Heisenbugs
- Bugs spanning multiple components or layers
- Problems that have resisted previous debugging attempts

## Usage

### Phase 1: Evidence Gathering
1. Collect all evidence — logs, stack traces, reproduction steps, environment details
2. Define the exact expected vs actual behavior
3. Create a minimal, reliable reproduction

### Phase 2: Hypothesis & Isolation
4. Formulate hypotheses about the root cause
5. Test each hypothesis with targeted experiments (add logging, inspect state, isolate variables)
6. Use binary search or divide-and-conquer to isolate the faulty component
7. Check assumptions at each layer (input, processing, output)

### Phase 3: Fix & Verify
8. Identify the definitive root cause
9. Implement the fix and add regression coverage
10. Verify with the reproduction case
11. Document findings for future reference

## Requirements

No special environment variables required.
