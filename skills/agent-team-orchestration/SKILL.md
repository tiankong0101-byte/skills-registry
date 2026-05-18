---
name: agent-team-orchestration
description: |
  Multi-agent task scheduling, resource allocation, workflow orchestration, and parallel task management.
  Trigger on complex workflows needing multiple specialized agents, resource-intensive parallel tasks, or team-based approaches.
metadata:
  openclaw:
    emoji: 👥
  security:
    allowed_domains: []
---

# Agent Team Orchestration — Unified

Orchestrates teams of specialized agents for complex workflows. Manages resource allocation, task scheduling, parallel execution, and output consolidation.

## Trigger Conditions

- Multi-disciplinary tasks requiring different expertise areas
- Workflows with parallel and sequential dependencies
- Large-scale projects benefiting from team collaboration
- Resource-intensive tasks needing balanced allocation
- Complex dependency graphs with parallel execution paths
- Any scenario where agent team formation improves efficiency

## Usage

### Role Assignment & Scheduling
1. Decompose the goal into discrete tasks
2. Assign roles to specialized agents based on capability
3. Schedule tasks respecting dependencies (parallel where possible)
4. Manage resource allocation across agents

### Parallel Execution
1. Identify independent subtasks for parallel execution
2. Execute concurrent agent tasks with resource monitoring
3. Handle task failures and retries
4. Synchronize results at dependency points

### Output Consolidation
1. Collect outputs from all agents
2. Resolve conflicts and merge results
3. Present unified deliverable

## Requirements

No special environment variables required.
