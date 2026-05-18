# systematic-debugging

Systematic debugging methodology - Always find root cause before attempting fixes.

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## When to Use

Use for ANY technical issue:

- Test failures
- Bugs in production
- Unexpected behavior
- Performance problems
- Build failures
- Integration issues

**Use this ESPECIALLY when:**
- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- You've already tried multiple fixes
- Previous fix didn't work
- You don't fully understand the issue

## The Four Phases

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

- **Read Error Messages Carefully**
  - Don't skip past errors or warnings
  - They often contain the exact solution
  - Read stack traces completely
  - Note line numbers, file paths, error codes

- **Reproduce Consistently**
  - Can you trigger it reliably?
  - What are the exact steps?
  - Does it happen every time?
  - If not reproducible → gather more data, don't guess

- **Check Recent Changes**
  - What changed that could cause this?
  - Git diff, recent commits
  - New dependencies, config changes
  - Environmental differences

- **Gather Evidence in Multi-Component Systems**
  - For EACH component boundary:
    - Log what data enters component
    - Log what data exits component
    - Verify environment/config propagation
    - Check state at each layer

- **Trace Data Flow**
  - Where does bad value originate?
  - What called this with bad value?
  - Keep tracing up until you find the source
  - Fix at source, not at symptom

### Phase 2: Pattern Analysis

**Find the pattern before fixing:**

- **Find Working Examples**
  - Locate similar working code in same codebase
  - What works that's similar to what's broken?

- **Compare Against References**
  - If implementing pattern, read reference implementation COMPLETELY
  - Don't skim - read every line

- **Identify Differences**
  - What's different between working and broken?
  - List every difference, however small

- **Understand Dependencies**
  - What other components does this need?
  - What settings, config, environment?

### Phase 3: Hypothesis and Testing

**Scientific method:**

- **Form Single Hypothesis**
  - State clearly: "I think X is the root cause because Y"
  - Write it down
  - Be specific, not vague

- **Test Minimally**
  - Make the SMALLEST possible change to test hypothesis
  - One variable at a time
  - Don't fix multiple things at once

- **Verify Before Continuing**
  - Did it work? Yes → Phase 4
  - Didn't work? Form NEW hypothesis
  - DON'T add more fixes on top

### Phase 4: Implementation

**Fix the root cause, not the symptom:**

- **Create Failing Test Case**
  - Simplest possible reproduction
  - Automated test if possible
  - MUST have before fixing

- **Implement Single Fix**
  - Address the root cause identified
  - ONE change at a time
  - No "while I'm here" improvements

- **Verify Fix**
  - Test passes now?
  - No other tests broken?
  - Issue actually resolved?

- **If 3+ Fixes Failed: Question Architecture**
  - Each fix reveals new shared state/coupling/problem in different place
  - Fixes require "massive refactoring" to implement
  - Each fix creates new symptoms elsewhere
  - STOP and question fundamentals

## Red Flags - STOP and Follow Process

If you catch yourself thinking:

- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- "Skip the test, I'll manually verify"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- "One more fix attempt" (when already tried 2+)

**ALL of these mean: STOP. Return to Phase 1.**

## Quick Reference

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| 1. Root Cause | Read errors, reproduce, check changes, gather evidence | Understand WHAT and WHY |
| 2. Pattern | Find working examples, compare | Identify differences |
| 3. Hypothesis | Form theory, test minimally | Confirmed or new hypothesis |
| 4. Implementation | Create test, fix, verify | Bug resolved, tests pass |

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | Simple issues have root causes too |
| "Emergency, no time for process" | Systematic debugging is FASTER than thrashing |
| "Just try this first, then investigate" | First fix sets the pattern. Do it right |
| "Multiple fixes at once saves time" | Can't isolate what worked. Causes new bugs |

## Real-World Impact

- Systematic approach: 15-30 minutes to fix
- Random fixes approach: 2-3 hours of thrashing
- First-time fix rate: 95% vs 40%
- New bugs introduced: Near zero vs common
