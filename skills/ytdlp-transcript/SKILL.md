---
name: ytdlp-transcript
description: |
  YouTube video transcript extraction and processing.
metadata:
  openclaw:
    emoji: 🎬
  security:
    allowed_domains:
      - youtube.com
      - www.youtube.com
      - youtu.be
---

# ytdlp-transcript

Specialized skill for extracting transcripts from YouTube videos and processing them into structured formats. Use when the user needs video captions, subtitles, or text content from YouTube videos.

## Trigger Conditions

- User asks to get the transcript or captions of a YouTube video
- User wants to summarize or analyze video content via its transcript
- User needs to search within a video's spoken content
- User requests translation of video captions

## Usage

1. **Validate URL** — Check that the provided URL is a valid YouTube video URL (youtube.com/watch, youtu.be, youtube.com/shorts). Extract the video ID.
2. **Fetch Transcript** — Retrieve the available transcript:
   - Try auto-generated captions first
   - Fall back to manual captions if auto-generated are unavailable
   - Support multiple language preferences
3. **Format Output** — Present the transcript in the requested format:
   - **Plain text**: Full transcript as continuous text
   - **Timed**: Segments with timestamps (-->> [MM:SS] text)
   - **Segmented**: By topic/chapter if available
   - **SRT/VTT**: Subtitle format for download
4. **Post-Processing** — Offer optional processing:
   - Summarization of key points
   - Translation to another language
   - Keyword/phrase search within transcript
   - Speaker diarization (if multiple speakers detected)
5. **Deliver** — Provide the transcript with metadata (video title, duration, language, line count).

## Requirements

- No external API keys required.
- Domain access: `youtube.com`, `www.youtube.com`, `youtu.be`.
- Requires `yt-dlp` or equivalent tool installed for transcript extraction.
