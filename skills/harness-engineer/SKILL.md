---
name: harness-engineer
description: |
  Multi-agent task scheduling, resource allocation and parallel task management.
  Trigger on resource-intensive parallel workflows requiring intelligent scheduling and resource management.
metadata:
  openclaw:
    emoji: ⛓️
    requires:
      env: []
    primaryEnv: ""
  security:
    allowed_domains: []
---

# harness-engineer

Manages resource allocation, task scheduling, and parallel execution for complex multi-agent workflows. Optimizes throughput by intelligently distributing work across available resources. Use this skill when dealing with resource-constrained or highly parallel workloads.

## Trigger Conditions

- Resource-intensive tasks needing balanced allocation
- Complex dependency graphs with parallel execution paths
- Workflows requiring throughput optimization
- Multi-agent systems needing coordinated resource management

## Usage

1. Assess available resources and task requirements
2. Build a dependency graph of all tasks
3. Schedule tasks across resources respecting dependencies
4. Monitor resource utilization and adjust allocation dynamically
5. Handle failures with graceful degradation and re-scheduling

## Requirements

- No special environment variables required
