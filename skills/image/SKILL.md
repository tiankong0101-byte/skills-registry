---
name: image
description: |
  Unified image skill — processing, analysis, generation, and graphic design.
  Triggers on any image task: edit, generate, analyze, OCR, brand assets, social media graphics.
metadata:
  openclaw:
    emoji: 🖼
  security:
    allowed_domains: []
---

# Image — Unified

Covers all image operations: **processing**, **generation** (with Nano Banana Pro / Gemini), and **graphic design**.

---

## Mode 1: Image Processing & Analysis

- Analyze: describe content, detect objects, OCR, color analysis
- Process: resize, crop, rotate, filter, compress, format convert
- Compare: find differences, similarity check

## Mode 2: Image Generation (Nano Banana Pro / Gemini 3 Pro)

```bash
# Generate new image
uv run ./scripts-nano-banana/generate_image.py \
  --prompt "your description" --filename "output.png" [--resolution 1K|2K|4K]

# Edit existing image
uv run ./scripts-nano-banana/generate_image.py \
  --prompt "editing instructions" --filename "output.png" \
  --input-image "input.png"
```

### Workflow: Draft → Iterate → Final
- Draft at 1K for fast feedback
- Refine at 2K
- Final at 4K

## Mode 3: Graphic Design

For brand assets, social media graphics, logos, illustrations:
- Define requirements (purpose, dimensions, brand colors, style)
- Generate concepts or mood boards
- Produce final assets in required formats
- Requires `OPENAI_API_KEY` for AI-powered design generation

## Best Practices

1. Start with processing/analysis for existing images
2. Use draft→iterate→final workflow for generation
3. Export in appropriate format (PNG for UI, SVG for logos, JPEG for photos)
