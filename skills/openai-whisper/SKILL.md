---
name: openai-whisper
description: |
  Speech-to-text transcription using OpenAI Whisper.
metadata:
  openclaw:
    emoji: 🎤
    requires:
      env:
        - OPENAI_API_KEY
    primaryEnv: OPENAI_API_KEY
  security:
    allowed_domains:
      - api.openai.com
---

# openai-whisper

## Trigger Conditions

- User provides an audio file for transcription
- Request to convert speech to text from meeting recordings, voice memos, etc.
- Batch processing of multiple audio files
- Language-specific transcription or translation tasks

## Usage

1. **Transcribe an audio file**:
   ```
   openai-whisper transcribe --file <audio-file> [--language <lang-code>]
   ```

2. **Transcribe with timestamps**:
   ```
   openai-whisper transcribe --file <audio-file> --timestamps
   ```

3. **Translate audio to English text**:
   ```
   openai-whisper translate --file <audio-file>
   ```

4. **Batch transcribe multiple files**:
   ```
   openai-whisper batch --files <dir-pattern>
   ```

## Requirements

- `OPENAI_API_KEY` environment variable must be set to a valid OpenAI API key
- Supported audio formats: mp3, wav, m4a, ogg, flac, webm
- Maximum file size: 25 MB per request (per OpenAI API limit)
- Network access to `api.openai.com`
