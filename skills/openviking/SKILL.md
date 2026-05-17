---
name: openviking
description: |
  Advanced memory retrieval with vector search and BM25 hybrid. Triggers on semantic search, vector similarity matching, and hybrid retrieval tasks.
metadata:
  openclaw:
    emoji: 🗺️
    requires:
      env:
        - OPENAI_API_KEY
    primaryEnv: OPENAI_API_KEY
  security:
    allowed_domains:
      - api.openai.com
---

# openviking

## Trigger Conditions

Activate when performing semantic search over stored content, vector similarity matching, hybrid search combining keyword and semantic approaches, or any task requiring advanced retrieval-augmented generation (RAG) techniques.

## Usage

Advanced hybrid retrieval system combining dense vector embeddings (semantic search) with sparse BM25 (keyword search) for optimal results:

- Generate embeddings for documents and queries using OpenAI models
- Perform semantic similarity search over memory stores
- Combine vector similarity with BM25 keyword scoring
- Support filtered and faceted retrieval
- Rerank results for relevance optimization
- Index and manage large document collections

## Requirements

- `OPENAI_API_KEY` environment variable with access to embedding models
- OpenAI API key from https://platform.openai.com
