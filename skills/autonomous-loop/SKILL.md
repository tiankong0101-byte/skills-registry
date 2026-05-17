---
name: autonomous-loop
description: |
  Background monitoring, anti-deadlock detection and automated pipeline execution.
  Trigger on long-running automated processes that require continuous monitoring and recovery.
metadata:
  openclaw:
    emoji: 🔄
    requires:
      env: []
    primaryEnv: ""
  security:
    allowed_domains: []
---

# autonomous-loop

Runs background monitoring loops with anti-deadlock detection, automated retry logic, and pipeline execution management. Use this skill for any process that needs to run continuously or on a schedule with self-healing capabilities.

## Trigger Conditions

- Continuous background monitoring and watchdogs
- Automated pipeline execution with retry logic
- Deadlock detection and recovery in long-running tasks
- Scheduled or recurring task execution

## Usage

1. Define the loop condition, interval, and termination criteria
2. Start the autonomous loop with monitoring hooks
3. On each iteration, execute the pipeline step and check for issues
4. If deadlock or stall detected, trigger recovery procedures
5. Log all iterations and report summary on completion

## Requirements

- No special environment variables required
