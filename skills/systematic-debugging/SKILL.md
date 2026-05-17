---
name: systematic-debugging
description: |
  Structured debugging methodology with step-by-step analysis.
metadata:
  openclaw:
    emoji: 📋
  security: {}
---

# systematic-debugging

Methodical step-by-step debugging methodology for hard-to-reproduce issues. Use when casual inspection fails and a rigorous approach is needed.

## Trigger Conditions

- Issues that cannot be reproduced reliably
- Bugs that only occur in specific environments or conditions
- Problems that have resisted previous debugging attempts
- Heisenbugs and non-deterministic failures

## Usage

1. Define the exact expected vs actual behavior
2. Create a minimal, reliable reproduction
3. Use binary search or divide-and-conquer to isolate the faulty component
4. Check assumptions at each layer (input, processing, output)
5. Gather evidence before jumping to conclusions
6. Verify the fix with the reproduction case and add it as a regression test

## Requirements

No special environment variables required.
