---
name: simplify
description: |
  Code simplification, redundancy removal and performance optimization.
metadata:
  openclaw:
    emoji: ✂️
  security: {}
---

# simplify

Code simplification and optimization skill. Use when cleaning up complex logic, removing dead code, or improving performance.

## Trigger Conditions

- Code is overly complex, nested, or hard to follow
- Dead code, unused imports, or redundant abstractions exist
- Performance bottlenecks in hot paths
- Refactoring tasks targeting readability or maintainability

## Usage

1. Understand the existing behavior by reading tests and usage sites
2. Identify simplification opportunities — duplicate logic, deep nesting, unnecessary indirection
3. Apply transformations (extract method, inline, flatten, early return, etc.)
4. Ensure zero behavior change — the public interface and semantics must be preserved
5. Run the full test suite to confirm correctness
6. Compare before/after metrics (LOC, cyclomatic complexity, performance)

## Requirements

No special environment variables required.
