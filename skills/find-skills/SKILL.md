---
name: find-skills
description: |
  Search and discover available skills across all skill directories. Triggers on finding relevant skills for a given task, skill discovery, and capability matching.
metadata:
  openclaw:
    emoji: 🔍
    requires:
      env: []
    primaryEnv: ''
  security:
    allowed_domains: []
---

# find-skills

## Trigger Conditions

Activate when the user needs to discover which skills are available for a given task, when searching for skills by keyword or capability, or when exploring the skill registry to understand what functionality exists.

## Usage

Search and discover skills across all skill directories. Supports:

- Keyword-based skill search across names and descriptions
- Capability matching to find skills relevant to a specific task
- Listing all available skills with metadata (emoji, description, requirements)
- Filtering by required environment variables or domains
- Displaying skill trigger conditions for quick reference

## Requirements

No API keys required. Searches the local skill registry directories.
