<div align="center">
  <h1>AnyRAG</h1>
  <p><b>Production-Ready Hybrid RAG System</b></p>
  
  [![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Qdrant](https://img.shields.io/badge/Qdrant-red?style=flat&logo=qdrant)](https://qdrant.tech/)
  [![ONNX](https://img.shields.io/badge/ONNX-FlashRank-orange)](#)
  [![MCP Server](https://img.shields.io/badge/MCP-Compatible-green)](#)
</div>

<br/>

AnyRAG is an end-to-end Retrieval-Augmented Generation (RAG) system built to parse and query complex document corpora (like EU Financial Regulations). It uses a powerful **two-stage retrieval funnel** to ensure both high recall and high precision, effectively solving the "Needle in a Haystack" problem.

While originally tested against EU Financial Regulations (PSD2, GDPR, MiFID II, DORA), it features a fully functional UI that lets you drag-and-drop your own PDFs to build a localized vector database and chat with your own data.

## Key Features

- **Hybrid Search (RRF):** Combines Lexical (BM25) and Dense (`BAAI/bge-base-en-v1.5` via Qdrant) search, fused with Reciprocal Rank Fusion for maximum recall.
- **Dual Reranking:** Supports both a PyTorch Cross-Encoder (`ms-marco-MiniLM-L-6-v2`) and ONNX FlashRank (`ms-marco-MiniLM-L-12-v2`, ~34MB, <100ms on CPU).
- **Query Decomposition:** LLM-powered query classification (`lookup`, `conceptual`, `compound`) with acronym expansion, synonym injection, and compound query decomposition.
- **Conversational Memory:** Automatically rewrites multi-turn follow-up questions into standalone queries using conversation history.
- **Verified Output:** Secondary LLM pass validates that every citation actually exists in the retrieved text and computes a composite confidence score.
- **Null Retrieval Fallback:** Cross-encoder score thresholding (< -2.0) triggers a graceful "I don't know" response instead of hallucinating.
- **Semantic Response Caching:** Cosine similarity cache (threshold 0.92, TTL-based expiry) short-circuits the entire pipeline on near-duplicate queries.
- **MCP Server:** Exposes the RAG pipeline as MCP tools for Claude Desktop, Cursor, or any MCP-compatible agent.
- **Langfuse Observability:** `@observe` decorators on every pipeline stage for per-trace latency, token usage, and retrieval score logging.
- **Frontend UI:** Industrial-aesthetic HTML/JS terminal interface with session management, retrieval mode switching, and drag-and-drop document upload.
- **Multi-Session Support:** Per-session isolated vector databases, BM25 indices, and conversation histories.
- **CI/CD:** GitHub Actions pipeline with Ruff linting and automated Ragas evaluation on pushes to `main`.

## Architecture Pipeline

![RAG Pipeline Architecture](assets/architecture.png)

1. **Ingest and Chunk:** Documents (PDF/HTML/TXT) are semantically chunked using `SentenceTransformer` topic-boundary detection and indexed into both a BM25 index and a Qdrant dense vector index.
2. **Conversation Rewrite:** Follow-up queries are rewritten into standalone questions using prior conversation turns.
3. **Semantic Cache Check:** The query embedding is compared against cached responses (cosine similarity >= 0.92). Cache hits bypass the entire retrieval and generation pipeline.
4. **Query Decomposition:** Queries are classified (`lookup`, `conceptual`, `compound`) and rewritten/decomposed using a few-shot prompted LLM call.
5. **Stage 1 - Recall:** Sub-queries hit both BM25 and Dense indices. Results are fused via Reciprocal Rank Fusion (RRF).
6. **Stage 2 - Precision:** Candidates are reranked using a Cross-Encoder or FlashRank to extract the best matches.
7. **Context Reorder:** "Lost in the Middle" sorting places the most critical chunks at the context edges, not buried in the middle.
8. **Generate and Verify:** The LLM generates a citation-backed answer. A secondary verification pass checks that every citation exists in the retrieved text and computes a composite confidence score.

## Quick Start

1. **Install dependencies:**
   ```bash
   uv sync
   ```
2. **Environment Variables:** Create a `.env` file with your Azure OpenAI credentials.
   ```env
   AZURE_OPENAI_API_KEY="..."
   AZURE_OPENAI_ENDPOINT="..."
   AZURE_OPENAI_DEPLOYMENT="..."
   ```
3. **Run Services (Docker):**
   ```bash
   docker-compose up --build
   ```
4. **Seed the Database:** Navigate to `http://localhost:8000` to upload PDFs, or run the seed script:
   ```bash
   docker-compose exec anyrag-api python scripts/seed.py
   ```

## MCP Integration (Claude Desktop / Cursor)

Expose AnyRAG as an [MCP server](https://modelcontextprotocol.io/) to let AI agents natively query your documents.

```bash
uv run python mcp_server.py
```

**Available Tools**

| Tool | Description |
|---|---|
| `query_regulation` | Full RAG pipeline. Returns an LLM-generated answer with chunk-level citations and confidence score. |
| `search_articles` | Retrieval only. Returns the top-k reranked articles with cross-encoder scores (no LLM call). |
| `list_regulations` | Corpus metadata. Returns available regulations and their article counts. |

**Claude Desktop Config**

```json
{
  "mcpServers": {
    "finrag": {
      "command": "uv",
      "args": ["run", "python", "mcp_server.py"],
      "cwd": "/path/to/finRAG"
    }
  }
}
```

## Evaluation Metrics (Ragas)

Evaluated against 32 complex, multi-hop, and adversarial "unanswerable" queries.

| Metric | Score | Note |
|---|---|---|
| **Context Precision** | `0.89` | Relevant chunks placed at the top of the context window. |
| **Context Recall** | `0.89` | Successfully retrieves the "needle" from the haystack. |
| **Faithfulness** | `0.72` | Strict prompt engineering penalizes hallucinated outside knowledge. |
| **Answer Relevancy** | `0.61` | Reduced verbosity and off-topic preamble via constrained generation. |

Run the evaluation harness:
```bash
uv run python eval/run_eval.py
```

*Built by [Amey Narwadkar](https://github.com/ameynarwadkar)*
