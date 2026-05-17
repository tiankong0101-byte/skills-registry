---
name: image
description: |
  Image processing, analysis and generation capabilities.
metadata:
  openclaw:
    emoji: 🖼
  security:
    allowed_domains: []
---

# image

Specialized skill for comprehensive image-related tasks including processing, analysis, manipulation, and generation. Use when the user needs to work with image files in any capacity.

## Trigger Conditions

- User asks to analyze, describe, or extract information from an image
- User requests image editing, resizing, cropping, or format conversion
- User needs to generate new images from descriptions
- User wants to compare images, detect differences, or perform OCR

## Usage

1. **Identify Task Type** — Classify the request:
   - **Analysis** — Describe content, detect objects, read text (OCR), analyze colors/composition
   - **Processing** — Resize, crop, rotate, filter, compress, convert format
   - **Generation** — Create new images from text descriptions or style transfer
   - **Comparison** — Find differences, check similarity, verify integrity
2. **Read Input** — Accept image files via provided paths or URLs. Validate format and accessibility.
3. **Execute** — Perform the requested operation. For analysis, provide detailed structured output. For processing, apply transformations. For generation, craft prompts and produce images.
4. **Deliver** — Return results (analysis text, processed image, generated image) with descriptions of what was done and any parameters used.

## Requirements

- No external API keys required for basic processing and analysis.
- Generation features may require `OPENAI_API_KEY` if using DALL-E or similar services.
