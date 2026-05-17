---
name: web-search-ex-skill
description: |
  Extended web search capabilities with multiple engine support. Triggers on general web research tasks requiring diverse search sources and fallback strategies.
metadata:
  openclaw:
    emoji: 🌐
    requires:
      env: []
    primaryEnv: ''
  security:
    allowed_domains: []
---

# web-search-ex-skill

## Trigger Conditions

Activate for general web research tasks, when a primary search engine fails, when multiple search sources are needed for comprehensive results, or when the task requires flexible search strategies with fallback support.

## Usage

Extended web search with multi-engine support and intelligent fallback:

- Route queries across multiple search engines
- Automatic fallback when primary engine is unavailable
- Compare and merge results from different sources
- Configurable search parameters per engine
- Rate limiting and retry logic for reliability
- Result deduplication and ranking across sources
- Support for specialized search domains (news, academic, code)

## Requirements

No API keys required by default. Individual search engines may require their own API keys when configured.
