---
name: podcast
description: |
  Podcast content generation, script writing and audio production.
metadata:
  openclaw:
    emoji: 🎙️
    requires:
      env:
        - ELEVENLABS_API_KEY
    primaryEnv: ELEVENLABS_API_KEY
  security:
    allowed_domains:
      - api.elevenlabs.io
---

# podcast

Specialized skill for end-to-end podcast production: topic research, script writing, voice synthesis, and audio export. Use when the user wants to create a podcast episode from scratch.

## Trigger Conditions

- User asks to create a podcast episode or series
- User requests script writing for audio content
- User needs voice synthesis or narration generation
- User wants audio production, editing, or mixing assistance

## Usage

1. **Define Episode Scope** — Clarify topic, target audience, tone (formal/casual/humorous), episode length, and format (solo, interview, panel, narrative).
2. **Research & Outline** — Gather information on the topic. Create an episode outline with segments: intro, main content, transitions, outro.
3. **Script Writing** — Write a conversational script optimized for spoken delivery:
   - Natural phrasing, short sentences, avoiding complex clauses
   - Mark emphasis points, pauses, and vocal tone cues
   - Include intro/outro music cues and segment transitions
4. **Voice Generation** — Use ElevenLabs API (when available) to generate natural-sounding narration:
   - Select appropriate voice(s) from available models
   - Generate audio segments per script section
   - Apply pacing and emphasis adjustments
5. **Audio Assembly** — Combine voice segments with intro/outro music. Ensure consistent volume levels and clean transitions.
6. **Export** — Provide the final audio file (MP3, WAV) with metadata (title, episode number, description).

## Requirements

- `ELEVENLABS_API_KEY` environment variable (optional) for AI voice generation.
- Without ElevenLabs, the skill provides script-only output.
- Domain access: `api.elevenlabs.io` for voice synthesis requests.
