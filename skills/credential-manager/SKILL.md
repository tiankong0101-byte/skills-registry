---
name: credential-manager
description: |
  Secure storage and management of API keys and credentials.
metadata:
  openclaw:
    emoji: 🔑
  security:
    allowed_domains: []
---

# credential-manager

## Trigger Conditions

- User requests credential setup, rotation, or retrieval
- New API key or secret needs to be stored securely
- Credential rotation schedule triggered
- Migration or backup of stored credentials

## Usage

1. **Store a new credential**:
   ```
   credential-manager set --key <SERVICE_API_KEY> --value <your-api-key>
   ```

2. **Retrieve a credential** (for use in workflows):
   ```
   credential-manager get --key <SERVICE_API_KEY>
   ```

3. **List all stored credentials** (names only, values masked):
   ```
   credential-manager list
   ```

4. **Rotate a credential** (generates new value and updates):
   ```
   credential-manager rotate --key <SERVICE_API_KEY>
   ```

5. **Remove a credential**:
   ```
   credential-manager remove --key <SERVICE_API_KEY>
   ```

## Requirements

- No environment variables required
- Secure file system storage (`~/.config/opencode/credentials/`)
- File permissions set to user-only access on credential store
- Encryption key management for at-rest encryption
