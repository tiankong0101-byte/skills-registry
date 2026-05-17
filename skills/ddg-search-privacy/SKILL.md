---
name: ddg-search-privacy
description: |
  Privacy-focused DuckDuckGo web search integration. Triggers on privacy-sensitive web searches where user data protection is a concern.
metadata:
  openclaw:
    emoji: 🦆
    requires:
      env: []
    primaryEnv: ''
  security:
    allowed_domains:
      - duckduckgo.com
      - html.duckduckgo.com
---

# ddg-search-privacy

## Trigger Conditions

Activate when the user requests a web search with explicit privacy concerns, or when searching for sensitive topics where search history privacy matters. Also triggered when the user asks for DuckDuckGo specifically.

## Usage

Use this skill for any web search where query privacy is important. The skill performs searches via DuckDuckGo's privacy-respecting API, ensuring that search queries are not logged or tracked. Results are returned without personalized filtering.

Key capabilities:
- Privacy-preserving web search with no tracking
- Safe search filtering support
- Region-specific search results
- No search history stored

## Requirements

No API keys required. Uses DuckDuckGo's public search interface.
