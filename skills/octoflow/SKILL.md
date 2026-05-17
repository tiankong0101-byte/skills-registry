---
name: octoflow
description: |
  Multi-branch workflow management and parallel task coordination.
  Trigger on complex branching workflows with conditional paths, merges, and parallel execution.
metadata:
  openclaw:
    emoji: 🐙
    requires:
      env: []
    primaryEnv: ""
  security:
    allowed_domains: []
---

# octoflow

Manages workflows with multiple branches, conditional paths, parallel execution, and result merging. Supports complex DAG-based workflow definitions with branching, joining, and error handling. Use this skill for any non-linear workflow that requires branching logic.

## Trigger Conditions

- Workflows with conditional branching (if/else, switch)
- Parallel execution paths that later merge
- Complex multi-stage pipelines with dependencies
- Any workflow requiring directed acyclic graph (DAG) execution

## Usage

1. Define the workflow as a DAG with nodes and edges
2. Specify branch conditions and parallel execution paths
3. Execute the workflow, following conditional branches
4. Synchronize parallel branches at merge points
5. Handle errors with branch-specific recovery or workflow abort
6. Return the consolidated workflow result

## Requirements

- No special environment variables required
