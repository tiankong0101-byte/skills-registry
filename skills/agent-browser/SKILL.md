---
name: agent-browser
description: |
  Browser automation and web interaction for AI agents.
  Trigger on web scraping, form filling, page interaction, and any browser-based automation tasks.
metadata:
  openclaw:
    emoji: 🌐
    requires:
      env:
        - BROWSER_WS_ENDPOINT
    primaryEnv: BROWSER_WS_ENDPOINT
  security:
    allowed_domains:
      - "*"
---

# agent-browser

Provides browser automation capabilities for AI agents, enabling web scraping, form filling, navigation, and DOM interaction. Use this skill whenever the agent needs to interact with web pages programmatically.

## Trigger Conditions

- Web scraping or data extraction from websites
- Form filling and submission tasks
- Page navigation and screenshot capture
- Any task requiring visual or interactive web access

## Usage

1. Connect to a browser instance via `BROWSER_WS_ENDPOINT`
2. Navigate to target URLs using the browse action
3. Extract page content, take screenshots, or interact with elements
4. Return structured results to the agent

## Requirements

- `BROWSER_WS_ENDPOINT` environment variable pointing to a running browser WebSocket endpoint
