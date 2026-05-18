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

## Core Principles

### Function Design
- **Single responsibility**: Each function does exactly one thing
- **Length control**: Target < 50 lines, ideal 10-30 lines
- **Parameter control**: ≤ 4 parameters; use data class or config object beyond that
- **Early return**: Use guard clauses to avoid deep nesting

### Code Organization
- **DRY**: Extract repeated logic into shared functions
- **Clear naming**: Names reveal intent, avoid single-letter (except loop vars)
- **No magic numbers**: Extract to named constants
- **Nesting control**: ≤ 3 levels deep

### Error Handling
- Catch specific exceptions, never bare `except:`
- Preserve original exception chain (`raise ... from e`)
- Use context managers for resource management

## Usage

1. Understand the existing behavior by reading tests and usage sites
2. Identify simplification opportunities — duplicate logic, deep nesting, unnecessary indirection
3. Apply transformations (extract method, inline, flatten, early return, etc.)
4. Ensure zero behavior change — the public interface and semantics must be preserved
5. Run the full test suite to confirm correctness
6. Compare before/after metrics (LOC, cyclomatic complexity, performance)

## Language-Specific Conventions

### Python
```python
# Type annotations
def process(user_id: int, data: dict) -> dict | None:

# list/dict comprehension (avoid nested)
result = [x for x in items if x.condition]

# Naming: snake_case (vars/funcs), PascalCase (classes), UPPER_SNAKE_CASE (constants)
```

### JavaScript / TypeScript
```javascript
// const/let, no var
// Arrow functions
const process = (data) => data.filter(x => x.valid);
// Destructuring
const { name, email } = user;
// Naming: camelCase (vars/funcs), PascalCase (classes/interfaces), UPPER_SNAKE_CASE (constants)
```

## Quality Checklist

### Function Level
- [ ] Length < 50 lines
- [ ] Nesting < 3 levels
- [ ] Single responsibility
- [ ] Meaningful naming

### Code Level
- [ ] No duplication
- [ ] No magic numbers
- [ ] No unused variables/imports
- [ ] Specific error handling

### Overall
- [ ] Language conventions followed
- [ ] Type annotations complete
- [ ] Readable and maintainable

## Frontend Coding Standards (web projects)

1. **HTML Safety**: dynamic content via `textContent`, no `innerHTML`; use `escapeHTML()` for `< > & ' "`
2. **Mobile**: `touch-action: manipulation`, tap targets ≥44px
3. **CSS Layout**: Flexbox/Grid, no float
4. **Responsive**: relative units (rem/em/%), viewport meta tag
5. **Performance**: LCP < 2.5s, INP < 200ms, CLS < 0.1

## Reference Docs

- [Refactoring Patterns](references/refactoring_patterns.md) — Early Return, Extract Method, Guard Clauses, Async/Await, etc.
- [Best Practices](references/best-practices.md) — Function design, code organization, error handling, performance
- [Troubleshooting](references/troubleshooting.md) — Code smell diagnosis, complexity analysis, automation tools

## Requirements

No special environment variables required.
