---
name: minimax-xlsx
description: |
  XLSX spreadsheet processing and data extraction.
metadata:
  openclaw:
    emoji: 📊
  security:
    allowed_domains: []
---

# minimax-xlsx

Specialized skill for creating, reading, and processing Microsoft Excel (.xlsx) spreadsheets. Use when the user needs to work with tabular data, generate reports, or perform spreadsheet-based data analysis.

## Trigger Conditions

- User asks to create an Excel spreadsheet or workbook
- User needs to extract data from an .xlsx file
- User requests data analysis, formulas, or pivot tables
- User wants report generation, budgeting, or data organization in spreadsheet format

## Usage

1. **Identify Task** — Determine the operation:
   - **Creation** — Generate new spreadsheets from structured data
   - **Parsing** — Read and extract data from existing .xlsx files
   - **Manipulation** — Add/modify sheets, rows, columns, formulas
   - **Analysis** — Compute summaries, statistics, aggregations
2. **Spreadsheet Creation** — When generating:
   - Multiple sheets with descriptive names
   - Headers with proper formatting (bold, frozen panes)
   - Data types: text, numbers, dates, currency, percentages
   - Formulas, conditional formatting, data validation
   - Charts, pivot tables (if requested)
   - Column widths and row heights for readability
3. **Data Extraction** — When parsing:
   - Return data as structured JSON or markdown tables
   - Preserve sheet names, column headers, and data types
   - Identify merged cells, formulas (show both formula and computed value)
4. **Validation** — Check for data integrity, correct formula references, and consistent formatting across sheets.

## Requirements

- No external API keys required.
- Output as a valid .xlsx file conforming to the Office Open XML format.
