---
name: paddleocr-doc-parsing
description: |
  OCR document parsing and text extraction using PaddleOCR.
metadata:
  openclaw:
    emoji: 👁️
  security:
    allowed_domains: []
---

# paddleocr-doc-parsing

## Trigger Conditions

- User provides an image or scanned document for text extraction
- Request to parse text from screenshots, photos, PDF scans
- Batch OCR processing of multiple document images
- Extracting structured data from invoices, receipts, or forms

## Usage

1. **Extract text from an image**:
   ```
   paddleocr-doc-parsing extract --file <image-path>
   ```

2. **Parse a multi-page document** (PDF scans):
   ```
   paddleocr-doc-parsing parse --file <pdf-path> --output <output-dir>
   ```

3. **Extract text with bounding boxes**:
   ```
   paddleocr-doc-parsing extract --file <image-path> --boxes
   ```

4. **Batch process a directory of images**:
   ```
   paddleocr-doc-parsing batch --dir <images-directory> --output <output-dir>
   ```

## Requirements

- No environment variables required
- Supported image formats: png, jpg, jpeg, bmp, tiff
- PDF support for scanned documents (image-based)
- Python 3.8+ with PaddlePaddle and PaddleOCR installed locally
- Sufficient local compute resources for OCR inference (CPU or GPU)
- Network access only for initial model download
