---
name: markdown-converter
description: |
  Document format conversion, content parsing and multi-format export.
metadata:
  openclaw:
    emoji: 📄
  security:
    allowed_domains: []
---

# markdown-converter

Specialized skill for converting documents between formats, parsing structured content, and exporting to various output formats. Use when the user needs to transform documents from one format to another.

## Trigger Conditions

- User asks to convert a document from one format to another (e.g., HTML to Markdown, Markdown to PDF)
- User needs to extract structured content from unstructured documents
- User requests batch conversion or format normalization
- User needs content parsed and re-exported in a different structure

## Usage

1. **Identify Source & Target Formats** — Determine the input format (Markdown, HTML, plain text, JSON, CSV, LaTeX, etc.) and desired output format.
2. **Parse Content** — Read and parse the source document. Handle edge cases: tables, code blocks, images, footnotes, front matter, embedded styles.
3. **Transform** — Convert the content while preserving fidelity:
   - **Markdown ↔ HTML**: Preserve headings, links, images, lists, code blocks, tables
   - **Markdown ↔ JSON**: Structured data export/import
   - **Markdown ↔ Plain Text**: Strip formatting while keeping structure
   - **Markdown → PDF/Word**: Add appropriate formatting, page breaks, styling
4. **Validate Output** — Check for data loss, broken links, malformed tables, or encoding issues.
5. **Deliver** — Provide the converted document and a summary of any content adjustments or warnings.

## Requirements

- No external API keys required.
- All conversion handled natively or via built-in tools.
