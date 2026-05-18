---
name: microsoft-markitdown
description: |
  微软官方文件转 Markdown 工具。将 PDF、DOCX、PPTX、XLSX、图片等多种格式转换为 Markdown。
  支持 PDF、Office 文档、图片、HTML、CSV、JSON、XML、ZIP、YouTube 等格式转 Markdown。
  触发场景：转换文件为 Markdown、PDF 转文字、Word 转 Markdown、Excel 转 Markdown、
  PowerPoint 转 Markdown、图片 OCR、网页转 Markdown。
---

# Microsoft MarkItDown

微软官方文件转 Markdown 工具（GitHub: 11.1万星）。

## 安装状态

Python 包已全局安装：
```bash
pip show markitdown
markitdown --help
```

## 支持格式

| 格式 | 支持 | 说明 |
|-----|------|------|
| PDF | ✅ | 直接转换，支持图片+OCR |
| DOCX | ✅ | Word 文档 |
| PPTX | ✅ | PowerPoint |
| XLSX | ✅ | Excel |
| 图片 | ✅ | 内置 OCR |
| HTML | ✅ | 网页 |
| CSV/TSV | ✅ | 表格数据 |
| JSON/XML | ✅ | 结构化数据 |
| ZIP | ✅ | 批量转换 |
| URL | ✅ | 直接转换网页为 Markdown |
| YouTube | ✅ | 视频字幕 |

## 使用方法

### 基础用法

```bash
# 文件转 Markdown
markitdown document.pdf -o output.md

# stdin 输入
cat document.pdf | markitdown

# 批量转换（ZIP）
markitdown archive.zip -o output/

# 保留图片 Base64
markitdown document.pdf --keep-data-uris -o output.md

# 使用 Document Intelligence（需 Azure 配置）
markitdown document.pdf -d -e https://xxx.cognitiveservices.azure.com/

# 列出可用插件
markitdown --list-plugins
```

### OpenCode 中调用

使用 Bash 工具执行：
```bash
markitdown <file> -o <output.md>
```

## 常用命令

```bash
# URL 转 Markdown（直接支持 HTTP/HTTPS）
markitdown https://example.com -o output.md

# DOCX 转 Markdown
markitdown file.docx -o file.md

# 保留图片（Base64 编码）
markitdown file.pdf --keep-data-uris -o file.md

# 指定文件类型
markitdown < file.bin -x .pdf -o file.md
```

## 输出说明

- 默认输出到 stdout
- 使用 `-o` 保存到文件
- 图片默认被截断，使用 `--keep-data-uris` 保留 Base64
- 表格自动转换为 Markdown 表格格式
