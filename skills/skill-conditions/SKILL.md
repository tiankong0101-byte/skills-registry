---
name: skill-conditions
description: "Path-filtered conditional skill activation system. Skills activate only when relevant files are touched. Inspired by Claude Code's dynamic skill discovery. Triggers: 'conditional skill', 'path activation', 'file-based skill', 'context switching'"
---

# Skill Conditions — Path-Filtered Activation

Skills activate automatically when matching file patterns are detected. Inspired by Claude Code's dynamic skill discovery system.

## Concept

Instead of manually invoking skills, the system detects what files you're working with and automatically activates relevant skills.

```
File Change Detected
    │
    ▼
Match Against Skill Paths
    │
    ▼
Activate Matching Skills
    │
    ▼
Inject into Context
```

## Path Pattern Format

Glob patterns with exclusions:

```yaml
paths:
  - "**/*.py"              # Python files
  - "**/requirements*.txt"  # Python dependencies
  - "**/pyproject.toml"    # Python project config
  - "**/*.ipynb"           # Jupyter notebooks
  exclude:
  - "**/venv/**"          # Exclude virtual env
  - "**/__pycache__/**"   # Exclude cache
```

## Pattern Examples

| Pattern | Matches | Doesn't Match |
|---------|---------|---------------|
| `**/*.py` | `src/main.py`, `tests/test.py` | `main.js` |
| `**/*.ts` | `src/app.ts`, `types.ts` | `app.js` |
| `**/*.vue` | `components/Button.vue` | `Button.vuex` |
| `**/*.md` | `README.md`, `docs/guide.md` | `readme.txt` |
| `**/package.json` | `package.json`, `apps/web/package.json` | `packages/pkg.json` |
| `**/*.config.*` | `webpack.config.js`, `.eslintrc.json` | `config.yaml` |
| `**/Dockerfile*` | `Dockerfile`, `Dockerfile.prod` | `docker-compose.yml` |
| `!node_modules/**` | Everything except node_modules | — |

## Skill Registration Examples

### Python Expert Skill
```yaml
---
name: python-expert
description: Python language expert
paths:
  - "**/*.py"
  - "**/requirements*.txt"
  - "**/pyproject.toml"
  - "**/setup.py"
  - "**/Pipfile"
exclude:
  - "**/venv/**"
  - "**/.venv/**"
  - "**/__pycache__/**"
---
# Python expertise here...
```

### React Developer Skill
```yaml
---
name: react-developer
description: React and frontend expert
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/package.json"
exclude:
  - "**/node_modules/**"
  - "**/*.test.{ts,tsx}"
---
# React expertise...
```

### Go Developer Skill
```yaml
---
name: go-developer
description: Go language expert
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
```

### Rust Developer Skill
```yaml
---
name: rust-developer
description: Rust language expert
paths:
  - "**/*.rs"
  - "**/Cargo.toml"
  - "**/Cargo.lock"
exclude:
  - "**/target/**"
---
```

### Cloud/AWS Skill
```yaml
---
name: aws-architect
description: AWS cloud architecture expert
paths:
  - "**/serverless.yml"
  - "**/sam-template.yaml"
  - "**/*.tf"
  - "**/terraform/**"
  - "**/cdk/**"
  - "**/Dockerfile*"
---
```

## Multi-Pattern Matching

Skills can have multiple path patterns — any match activates the skill:

```yaml
paths:
  - "**/*.py"           # Match any Python file
  - "**/*.js"           # OR any JavaScript file
  - "**/*.ts"           # OR any TypeScript file
```

## Priority and Conflicts

When multiple skills match:

1. **Most specific wins** — `src/main.py` triggers both `python-expert` and `backend-developer` → prefer more specific
2. **Alphabetical tiebreak** — same specificity → alphabetical by name
3. **All non-conflicting skills activate** — no mutual exclusion

## Dynamic Discovery

The system also scans parent directories for skill hints:

```
/project/
├── .claude/
│   └── skills/          # Project-local skills
│       ├── api-design.md
│       └── frontend.md
├── src/
│   └── ...
├── docs/
│   └── ...
```

Project-local skills in `.claude/skills/` are automatically discovered.

## File Change Detection

```javascript
// Simple file watcher for skill activation
const chokidar = require('chokidar');

function watchForSkills(watchPaths) {
  const watcher = chokidar.watch(watchPaths, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on('change', async (filePath) => {
    const matchedSkills = await findMatchingSkills(filePath);
    for (const skill of matchedSkills) {
      await activateSkill(skill);
    }
  });

  return watcher;
}
```

## Context Injection

When a skill activates, inject relevant context:

```javascript
async function activateSkill(skill) {
  // Read skill content
  const content = await readSkill(skill.name);
  
  // Check if already in context
  if (isSkillActive(skill.name)) return;
  
  // Add to active skills
  setSkillActive(skill.name, true);
  
  // Inject into context
  await injectIntoContext(content);
  
  // Auto-deactivate after context shift
  setTimeout(() => {
    if (contextChanged(skill.paths)) {
      setSkillActive(skill.name, false);
    }
  }, 60000); // 1 minute grace period
}
```

## Manual Override

User can force-activate or force-deactivate skills:

```
> /skill python-expert
Activated: python-expert

> /skill python-expert off
Deactivated: python-expert
```

## Configuration

```yaml
# skill-conditions.yaml
enabled: true
watch-paths:
  - "**/*"
exclude-dirs:
  - "**/node_modules/**"
  - "**/.git/**"
  - "**/dist/**"
  - "**/build/**"
  - "**/__pycache__/**"
  - "**/.venv/**"
max-concurrent: 5
grace-period-ms: 60000
```
