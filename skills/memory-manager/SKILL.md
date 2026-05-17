---
name: memory-manager
description: |
  Knowledge management, contextual reuse and information retrieval. Triggers on memory storage, retrieval, and knowledge management tasks for agent systems.
metadata:
  openclaw:
    emoji: 💾
    requires:
      env: []
    primaryEnv: ''
  security:
    allowed_domains: []
---

# memory-manager

## Trigger Conditions

Activate when storing information for later recall, retrieving previously stored context, managing knowledge bases, or performing any memory read/write operations for the agent system.

## Usage

Centralized memory management for agent systems. Handles the full lifecycle of agent memories:

- Store structured and unstructured information with metadata
- Retrieve relevant context based on semantic similarity or keywords
- Manage memory namespaces for different contexts or sessions
- Update and delete existing memory entries
- Search and filter memories by time, topic, or relevance
- Export and import memory snapshots

## Requirements

No API keys required. Uses local or configured storage backend for persistence.
