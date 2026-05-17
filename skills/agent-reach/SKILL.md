---
name: agent-reach
description: |
  Multi-source information retrieval and data gathering.
  Trigger on research tasks requiring data from multiple sources, APIs, or web searches.
metadata:
  openclaw:
    emoji: 🎯
    requires:
      env:
        - OPENCODE_API_KEY
    primaryEnv: OPENCODE_API_KEY
  security:
    allowed_domains:
      - "*"
---

# agent-reach

Performs multi-source information retrieval by querying web search engines, APIs, databases, and document stores simultaneously. Use this skill for comprehensive research tasks that require gathering data from diverse sources.

## Trigger Conditions

- Research and data gathering from multiple online sources
- Competitive analysis and market research
- Fact-checking across different references
- Aggregating information from APIs, websites, and databases

## Usage

1. Define the research query and target sources
2. Execute parallel queries across configured sources
3. Collect and deduplicate results
4. Present a consolidated, cited summary

## Requirements

- `OPENCODE_API_KEY` environment variable for API authentication
