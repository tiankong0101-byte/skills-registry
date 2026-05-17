---
name: loop
description: |
  Automated task looping with status monitoring and completion tracking.
  Trigger on iterative/repetitive task execution that needs to loop until a condition is met.
metadata:
  openclaw:
    emoji: 🔁
    requires:
      env: []
    primaryEnv: ""
  security:
    allowed_domains: []
---

# loop

Executes tasks in a loop with configurable iteration limits, status monitoring, and completion tracking. Supports conditional termination, progress reporting between iterations, and error handling. Use this skill for any repetitive or iterative workflow.

## Trigger Conditions

- Repetitive operations on lists or collections
- Iterative refinement and improvement cycles
- Polling until a condition is satisfied
- Batch processing with progress tracking across iterations

## Usage

1. Define the task to execute and the loop condition
2. Specify iteration limits (max count, timeout, or success condition)
3. Run the loop, reporting progress after each iteration
4. Support early termination if condition is met
5. Return aggregated results and iteration statistics

## Requirements

- No special environment variables required
