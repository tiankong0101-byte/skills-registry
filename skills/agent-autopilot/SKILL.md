---
name: agent-autopilot
description: |
  Autonomous task execution with progress tracking and delivery.
  Trigger on long-running multi-step tasks that require autonomous planning, execution, and reporting.
metadata:
  openclaw:
    emoji: 🤖
    requires:
      env:
        - OPENCODE_API_KEY
    primaryEnv: OPENCODE_API_KEY
  security:
    allowed_domains: []
---

# agent-autopilot

Autonomously executes long-running multi-step tasks with built-in progress tracking, checkpointing, and final delivery reporting. Use this skill when a task requires multiple sequential steps, external tool calls, or spans multiple reasoning cycles.

## Trigger Conditions

- Tasks described as "long-running", "multi-step", or "autonomous"
- Requests involving planning, executing, and summarizing results
- Complex workflows that require the agent to decide the order of operations

## Usage

1. The agent receives a high-level goal
2. It decomposes the goal into a step-by-step plan
3. Each step is executed with progress updates
4. Upon completion, a final summary with key results is delivered

## Requirements

- `OPENCODE_API_KEY` environment variable set for API access
