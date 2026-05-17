---
name: agent-memory
description: |
  Persistent memory and context management for agent sessions.
  Trigger on tasks needing cross-session memory retention, context recall, or long-term knowledge storage.
metadata:
  openclaw:
    emoji: 🧠
    requires:
      env:
        - OPENCODE_API_KEY
    primaryEnv: OPENCODE_API_KEY
  security:
    allowed_domains: []
---

# agent-memory

Provides persistent memory capabilities across agent sessions, allowing the agent to store, retrieve, and manage contextual information over time. Use this skill when tasks require remembering user preferences, past interactions, or accumulated knowledge.

## Trigger Conditions

- Tasks that reference previous conversations or sessions
- Requests to "remember" or "store" information for later
- Workflows requiring context retention across multiple turns
- Personalized interactions that depend on historical data

## Usage

1. Store key-value pairs or structured data into persistent memory
2. Retrieve stored context by key or semantic search
3. Update or delete existing memory entries
4. List all stored memories for a given session or namespace

## Requirements

- `OPENCODE_API_KEY` environment variable for API authentication
