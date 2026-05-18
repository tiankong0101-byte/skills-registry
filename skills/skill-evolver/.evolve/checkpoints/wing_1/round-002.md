# debug-pro

Systematic debugging methodology and language-specific debugging commands.

## The 7-Step Debugging Protocol

1. **Reproduce** — Get it to fail consistently. Document exact steps, inputs, and environment.
2. **Isolate** — Narrow scope. Comment out code, use binary search, check recent commits with `git bisect`.
3. **Hypothesize** — Form a specific, testable theory about the root cause.
4. **Instrument** — Add targeted logging, breakpoints, or assertions.
5. **Verify** — Confirm root cause. If hypothesis was wrong, return to step 3.
6. **Fix** — Apply the minimal correct fix. Resist the urge to refactor while debugging.
7. **Regression Test** — Write a test that catches this bug. Verify it passes.

## Language-Specific Debugging

### JavaScript / TypeScript