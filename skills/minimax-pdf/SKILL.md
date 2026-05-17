---
name: minimax-pdf
description: |
  PDF document parsing, analysis and generation.
metadata:
  openclaw:
    emoji: 📕
  security:
    allowed_domains: []
---

# minimax-pdf

Specialized skill for reading, analyzing, and generating PDF documents. Use when the user needs to extract content from PDFs, create PDF documents, or manipulate existing PDF files.

## Trigger Conditions

- User asks to read, parse, or extract text/images from a PDF file
- User needs to create a PDF document from content
- User requests PDF merging, splitting, or page manipulation
- User wants to fill PDF forms or add annotations

## Usage

1. **Identify Operation** — Determine the task:
   - **Parsing** — Extract text, tables, images, and metadata from PDFs
   - **Generation** — Create PDFs from markdown, HTML, or structured data
   - **Manipulation** — Merge, split, rotate, reorder pages; add watermarks or headers/footers
   - **Forms** — Fill form fields, extract form data, flatten forms
2. **Parsing Details** — When extracting content:
   - Preserve reading order, heading hierarchy, and list structures
   - Extract tables with row/column structure intact
   - Identify and extract embedded images where requested
3. **Generation Details** — When creating PDFs:
   - Support text, images, tables, hyperlinks, and bookmarks
   - Apply consistent styling and proper page layout
   - Handle multi-page content with appropriate page breaks
4. **Deliver** — Provide the output PDF file or extracted content in the requested format.

## Requirements

- No external API keys required.
- PDF generation and manipulation performed using native libraries.
