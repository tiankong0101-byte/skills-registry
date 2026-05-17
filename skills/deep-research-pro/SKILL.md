---
name: deep-research-pro
description: |
  In-depth information research, data collection, competitive analysis and source verification.
metadata:
  openclaw:
    emoji: 📚
    requires:
      env:
        - TAVILY_API_KEY
    primaryEnv: TAVILY_API_KEY
  security:
    allowed_domains:
      - api.tavily.com
      - www.google.com
      - www.bing.com
      - duckduckgo.com
---

# deep-research-pro

Comprehensive research skill for in-depth information gathering. Use when the task requires thorough investigation across multiple sources.

## Trigger Conditions

- Research tasks requiring multi-source verification
- Competitive analysis or market research
- Technical deep dives into unfamiliar domains
- Fact-checking and source validation

## Usage

1. Define the research scope with clear questions and boundaries
2. Search across multiple engines (Tavily, web search) with tailored queries
3. Cross-reference findings from different sources for accuracy
4. Extract and organize key findings with source citations
5. Synthesize into a structured report with actionable insights
6. Flag any conflicting information or low-confidence claims

## Requirements

- **TAVILY_API_KEY**: Required for Tavily search integration. Get one at https://app.tavily.com.
- Web search fallbacks used when Tavily is unavailable.
