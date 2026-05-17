---
name: github
description: |
  GitHub repository management, PR creation and code review integration. Triggers on GitHub operations including repository management, pull requests, issues, and code reviews.
metadata:
  openclaw:
    emoji: 🐙
    requires:
      env:
        - GITHUB_TOKEN
    primaryEnv: GITHUB_TOKEN
  security:
    allowed_domains:
      - github.com
      - api.github.com
      - raw.githubusercontent.com
---

# github

## Trigger Conditions

Activate when performing GitHub operations such as creating or reviewing pull requests, managing issues, forking repositories, browsing code, managing workflows, or any interaction with GitHub repositories.

## Usage

Comprehensive GitHub integration for repository management. Supports:

- Repository CRUD operations (create, fork, delete)
- Pull request creation, review, and merging
- Issue management (create, comment, close, label)
- Code review with inline comments
- Workflow and action monitoring
- Release management
- Branch and tag management
- Commit history inspection
- Repository search and discovery

## Requirements

- `GITHUB_TOKEN` environment variable with appropriate repository scopes
- Token should have `repo`, `workflow`, and `pull_requests` scopes for full functionality
