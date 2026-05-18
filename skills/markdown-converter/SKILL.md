---
name: markdown-converter
description: |
  Unified document processor — format conversion, OCR, PDF manipulation, Word/Excel generation.
  Triggers on any document task: convert, OCR, parse, create, edit PDF/DOCX/XLSX.
metadata:
  openclaw:
    emoji: 📄
  security:
    allowed_domains: []
---

# Document Processor — Unified

A single interface for all document operations: **conversion**, **OCR**, **PDF**, **Word**, and **Excel**.

## Mode Selection

| Mode | Capabilities | Prerequisites |
|------|-------------|---------------|
| Convert | Markdown ↔ HTML/JSON/Plain Text, batch normalization | None |
| OCR | Image/scan → text (PaddleOCR) | PaddleOCR installed |
| PDF | Parse, generate, merge, split, fill forms | Python PDF libs |
| PDF (NL Edit) | Natural-language PDF page editing | `pip install nano-pdf` |
| Word | Create/edit DOCX documents | Python-docx |
| Excel | Create/read XLSX, data analysis | openpyxl |

---

## Mode 1: Format Conversion

Markdown ↔ HTML, Markdown ↔ JSON, Markdown ↔ Plain Text. Preserve headings, links, images, lists, code blocks, tables, footnotes, front matter.

## Mode 2: OCR (Image/Scan → Text)

```bash
paddleocr-doc-parsing extract --file <image-path>
paddleocr-doc-parsing parse --file <pdf-path> --output <output-dir>
```

For screenshots, scanned documents, invoices, receipts, forms.

## Mode 3: PDF Operations

- **Parsing**: Extract text, tables, images, metadata
- **Generation**: Create PDFs from markdown, HTML, or structured data
- **Manipulation**: Merge, split, rotate, reorder, watermarks
- **Forms**: Fill form fields, extract data, flatten

### Natural-Language PDF Editing
```bash
nano-pdf edit deck.pdf 1 "Change the title to 'Q3 Results'"
```

## Mode 4: Word Documents

Create and edit .docx files with formatted text, tables, images, headers.

## Mode 5: Excel Spreadsheets

Create, read, and analyze .xlsx files. Generate reports, extract data, apply formatting.

## Best Practice

1. OCR first for scanned documents → then convert to target format
2. PDF for fixed-layout output, DOCX for editable documents
3. Excel for tabular data and reports
