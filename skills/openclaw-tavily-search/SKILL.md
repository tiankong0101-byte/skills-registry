---
name: openclaw-tavily-search
description: |
  Tavily search engine integration for OpenClaw. Triggers on OpenClaw-specific search tasks requiring AI-optimized web search results.
metadata:
  openclaw:
    emoji: 🦞
    requires:
      env:
        - TAVILY_API_KEY
    primaryEnv: TAVILY_API_KEY
  security:
    allowed_domains:
      - api.tavily.com
---

# openclaw-tavily-search

## Trigger Conditions

Activate when performing web searches specifically within the OpenClaw agent framework, or when the task requires high-quality, AI-optimized search results using the Tavily API.

## Usage

Tavily search engine integration tailored for OpenClaw. Provides:

- AI-optimized web search results with context extraction
- Configurable search depth (basic to comprehensive)
- Result summarization for efficient consumption
- Domain filtering and inclusion/exclusion
- News and general web search modes
- Fresh content prioritization

## Requirements

- `TAVILY_API_KEY` environment variable
- Obtain API key from https://app.tavily.com
