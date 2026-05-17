---
name: agent-fork
description: |
  Fork and parallelize agent tasks for concurrent execution.
  Trigger on tasks that can be split into independent parallel subtasks for faster completion.
metadata:
  openclaw:
    emoji: 🔀
    requires:
      env: []
    primaryEnv: ""
  security:
    allowed_domains: []
---

# agent-fork

Enables forking a task into multiple parallel subtasks that execute concurrently, then merges results. Use this skill when a workload can be partitioned into independent units of work that do not depend on each other.

## Trigger Conditions

- Large datasets that can be processed in chunks
- Independent subtasks that don't share state
- Performance-critical tasks where parallel execution reduces wall-clock time
- Batch processing and parallel search scenarios

## Usage

1. Identify independent subtasks within the main task
2. Fork each subtask to a separate agent instance
3. Execute all subtasks concurrently
4. Collect and merge results from all forks
5. Return the combined output

## Requirements

- No special environment variables required
