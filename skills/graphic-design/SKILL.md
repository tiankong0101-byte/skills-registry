---
name: graphic-design
description: |
  Visual design, image generation and graphic content creation.
metadata:
  openclaw:
    emoji: 🖼️
    requires:
      env:
        - OPENAI_API_KEY
    primaryEnv: OPENAI_API_KEY
  security:
    allowed_domains: []
---

# graphic-design

Specialized skill for creating visual assets, social media graphics, banners, logos, illustrations, and other graphic design work. Use when the user needs visual content for branding, marketing, or presentation.

## Trigger Conditions

- User requests social media graphics, banners, or advertisements
- User needs logo design, brand assets, or illustrations
- User asks for image generation, editing, or composition
- User needs visual content for presentations or marketing materials

## Usage

1. **Define Requirements** — Clarify purpose (social media, print, web), dimensions, format, brand colors, and style preferences (minimalist, illustrative, corporate, etc.).
2. **Concept Exploration** — Generate multiple visual concepts or mood boards for user review.
3. **Design Execution** — Create the graphic asset using appropriate tools. For AI image generation, craft detailed prompts.
4. **Refinement** — Iterate based on user feedback. Adjust colors, typography, composition, and elements.
5. **Export** — Deliver final assets in required formats (PNG, SVG, JPG, PDF). Provide source descriptions or generation parameters for reproducibility.

## Requirements

- `OPENAI_API_KEY` environment variable required for DALL-E image generation.
- For non-AI graphic creation, no API key is needed.
