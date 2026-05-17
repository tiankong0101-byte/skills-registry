---
name: skill-indexer
description: |
  Maintain skill registry, indexing and discovery across directories.
metadata:
  openclaw:
    emoji: 📇
  security:
    allowed_domains: []
---

# skill-indexer

## Trigger Conditions

- User requests skill indexing or registry rebuild
- New skill added or existing skill removed
- Synchronization of skill metadata across directories
- Generating search indexes for skill discovery

## Usage

1. **Rebuild the skill index**:
   ```
   skill-indexer rebuild
   ```

2. **Index a specific skill directory**:
   ```
   skill-indexer index --path <skills-directory>
   ```

3. **Search for skills by keyword**:
   ```
   skill-indexer search --query "<keyword>"
   ```

4. **List all indexed skills** with metadata:
   ```
   skill-indexer list
   ```

5. **Validate index integrity**:
   ```
   skill-indexer validate
   ```

## Requirements

- No environment variables required
- Read access to all skill directories to be indexed
- Write access to index storage location
- Parse SKILL.md frontmatter for metadata extraction
