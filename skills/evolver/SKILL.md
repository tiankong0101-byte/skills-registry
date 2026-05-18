---
name: capability-evolver
description: |
  Self-iteration of system capabilities, error review and process optimization. A self-evolution engine that analyzes runtime history to identify improvements and applies protocol-constrained evolution.
tags: [meta, ai, self-improvement, core]
permissions: [network, shell]
metadata:
  openclaw:
    emoji: 🧬
  security: {}
  clawdbot:
    requires:
      bins: [node, git]
      env: [A2A_NODE_ID]
    files: ["src/**", "scripts/**", "assets/**"]
  capabilities:
    allow:
      - execute: [git, node, npm]
      - network: [api.github.com, evomap.ai]
      - read: [workspace/**]
      - write: [workspace/assets/**, workspace/memory/**]
    deny:
      - execute: ["!git", "!node", "!npm", "!ps", "!pgrep", "!df"]
      - network: ["!api.github.com", "!*.evomap.ai"]
  env_declarations:
    - name: A2A_NODE_ID
      required: true
      description: EvoMap node identity. Set after node registration.
    - name: A2A_HUB_URL
      required: false
      default: https://evomap.ai
      description: EvoMap Hub API base URL.
    - name: A2A_NODE_SECRET
      required: false
      description: Node authentication secret (issued by Hub on first hello).
    - name: GITHUB_TOKEN
      required: false
      description: GitHub API token for auto-issue reporting and releases.
    - name: EVOLVE_STRATEGY
      required: false
      default: balanced
      description: "Evolution strategy: balanced, innovate, harden, repair-only, early-stabilize, steady-state, auto."
    - name: EVOLVE_ALLOW_SELF_MODIFY
      required: false
      default: "false"
      description: Allow evolution to modify evolver source code. NOT recommended.
    - name: EVOLVE_LOAD_MAX
      required: false
      default: "2.0"
      description: Max 1-min load average before evolver backs off.
    - name: EVOLVER_ROLLBACK_MODE
      required: false
      default: hard
      description: "Rollback strategy on failure: hard, stash, none."
    - name: EVOLVER_LLM_REVIEW
      required: false
      default: "0"
      description: Enable second-opinion LLM review before solidification.
    - name: EVOLVER_AUTO_ISSUE
      required: false
      default: "0"
      description: Auto-create GitHub issues on repeated failures.
    - name: EVOLVER_MODEL_NAME
      required: false
      description: LLM model name injected into published asset metadata.
    - name: MEMORY_GRAPH_REMOTE_URL
      required: false
      description: Remote memory graph service URL (optional KG integration).
    - name: MEMORY_GRAPH_REMOTE_KEY
      required: false
      description: API key for remote memory graph service.
  network_endpoints:
    - host: api.github.com
      purpose: Release creation, changelog publishing, auto-issue reporting
      auth: GITHUB_TOKEN (Bearer)
      optional: true
    - host: evomap.ai (or A2A_HUB_URL)
      purpose: A2A protocol (hello, heartbeat, publish, fetch, reviews, tasks)
      auth: A2A_NODE_SECRET (Bearer)
      optional: false
    - host: MEMORY_GRAPH_REMOTE_URL
      purpose: Remote knowledge graph sync
      auth: MEMORY_GRAPH_REMOTE_KEY
      optional: true
---

# Capability Evolver

Self-iteration and process optimization skill. Reviews past errors, analyzes runtime history, and improves system capabilities over time.

## Trigger Conditions

- Recurring errors or failure patterns are detected
- System performance degrades over time
- Process improvements are requested
- Reviewing historical execution logs for optimization opportunities

## Usage

### Lightweight Mode (SKILL.md only)
1. Collect error logs, execution traces, and performance metrics from recent sessions
2. Categorize issues by type (tool errors, logic bugs, missing coverage, timeout, etc.)
3. Identify the top root causes and propose systematic fixes
4. Update configurations, prompts, or workflows to prevent recurrence
5. Track improvements over iterations and measure reduction in error rates

### Full Engine Mode (Node.js)
The evolver ships with a full Node.js engine for protocol-constrained self-evolution:

**Standard Run (Automated):**
```bash
node index.js
```

**Review Mode (Human-in-the-Loop):**
```bash
node index.js --review
```

**Mad Dog Mode (Continuous Loop):**
```bash
node index.js --loop
```

### Setup
1. Register node identity with EvoMap network
2. Run the hello flow to receive a `node_id` and claim code
3. Visit `https://evomap.ai/claim/<claim-code>` within 24 hours
4. Set `A2A_NODE_ID` in environment

### GEP Protocol (Auditable Evolution)
- `assets/gep/genes.json`: reusable Gene definitions
- `assets/gep/capsules.json`: success capsules
- `assets/gep/events.jsonl`: append-only evolution events

## Requirements

No special environment variables required for lightweight mode.
Full engine mode requires: `A2A_NODE_ID`, Node.js, git.
