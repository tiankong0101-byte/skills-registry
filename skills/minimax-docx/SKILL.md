---
name: minimax-docx
description: |
  DOCX document processing and generation.
metadata:
  openclaw:
    emoji: 📝
  security:
    allowed_domains: []
---

# minimax-docx

Specialized skill for creating, editing, and processing Microsoft Word (.docx) documents. Use when the user needs to generate reports, proposals, letters, resumes, or any Word-compatible document.

## Trigger Conditions

- User asks to create a Word document (report, letter, resume, proposal, contract)
- User needs to edit or modify an existing .docx file
- User wants to convert content to Word format
- User requests mail merge, template filling, or batch document generation

## Usage

1. **Gather Requirements** — Determine document type, structure (sections, headings), styling (fonts, colors, spacing), and any templates to use.
2. **Generate Content** — Create the document content with proper structure:
   - Title page, table of contents, headers/footers, page numbers
   - Sections with headings (multi-level), paragraphs, lists (bulleted/numbered)
   - Tables with merged cells, styled rows, and column widths
   - Images, hyperlinks, footnotes/endnotes
3. **Apply Styling** — Use consistent styles (Heading 1-4, Normal, Subtitle) for proper document navigation and accessibility.
4. **Export** — Generate the .docx file and provide a download link or file path.
5. **Validate** — Check for correct page breaks, proper table rendering, and consistent formatting throughout.

## Requirements

- No external API keys required.
- Output as a valid .docx file using the Open XML format.
