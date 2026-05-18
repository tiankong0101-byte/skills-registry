---
name: tavily-search
description: |
  Web search integration using Tavily search API. Triggers on AI-optimized web search tasks requiring high-quality, contextual search results. Supports both general and OpenClaw-specific usage.
metadata:
  openclaw:
    emoji: 🔎
    requires:
      env:
        - TAVILY_API_KEY
    primaryEnv: TAVILY_API_KEY
  security:
    allowed_domains:
      - api.tavily.com
---

# tavily-search

## Trigger Conditions

Activate when the user needs web search results optimized for AI consumption, when searching for current information, or when a task requires accurate, cited web content with context extraction. Works in both general agent and OpenClaw agent frameworks.

## Usage

General-purpose Tavily search integration providing AI-optimized web search:

- Contextual search results with relevant snippet extraction
- Multiple search depth options (quick to deep research)
- Configurable search depth (basic to comprehensive)
- News search with date filtering
- Domain inclusion/exclusion for targeted results
- Result count configuration
- Automatic content summarization
- Citation support with source URLs
- Fresh content prioritization

## Requirements

- `TAVILY_API_KEY` environment variable
- Obtain API key from https://app.tavily.com
