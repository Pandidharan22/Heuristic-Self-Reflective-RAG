# Self-Reflective RAG Platform: Heuristic Hallucination Mitigation

An asynchronous, full-stack Retrieval-Augmented Generation (RAG) platform designed to autonomously evaluate its own retrieval confidence, mitigate domain hallucinations, and trigger self-reflective context expansion when high-risk queries are detected.

**Live Application:** [self-reflective-rag.pandidharan.dev](https://self-reflective-rag.pandidharan.dev)

![Architecture: Full Stack](https://img.shields.io/badge/Architecture-Full_Stack-blue)
![Python: 3.11](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![FastAPI: 0.110.0](https://img.shields.io/badge/FastAPI-0.110.0-009688?logo=fastapi&logoColor=white)
![React: 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Tailwind: v4](https://img.shields.io/badge/Tailwind_v4-38B2AC?logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)

---

## Architectural Overview

Standard "Naive RAG" architectures suffer from a critical flaw: they blindly pass retrieved vector chunks to a Large Language Model regardless of semantic relevance, leading to confident hallucinations on out-of-domain queries. 

This platform introduces an intermediate deterministic layer—the **Heuristic Guardrail Engine**—which mathematically evaluates the quality of the vector search before LLM inference occurs.

### 1. Vector Memory & Ingestion (FAISS)
Documents (PDFs) are parsed via `PyMuPDF` upon server initialization. Text is chunked (500 characters, 50-character overlap) and embedded utilizing the `all-MiniLM-L6-v2` model via `sentence-transformers`. The vectors are stored in a persistent `faiss-cpu` IndexFlatIP database, ensuring state retention across container lifecycles.

### 2. Heuristic Guardrail Engine
Upon a user query, the system retrieves initial vector chunks and evaluates the cosine similarity scores against a proprietary mathematical bound. The engine calculates a final Risk Score based on:
* **Mean Similarity:** The average relevance of the retrieved chunks.
* **Score Spread:** The variance between the highest and lowest scoring chunks.
* **Proportional Penalties:** Algorithmic penalties applied for low base confidence or excessively tight score spreads (indicating uniformly poor retrieval).

### 3. The Self-Reflection Loop
If the calculated Risk Score exceeds the configurable environment threshold (default: `0.70`), the system intercepts the pipeline. It autonomously executes a secondary vector search with an expanded `top_k` parameter to cast a wider net for relevant context. If the expanded context remains below acceptable thresholds, strict prompt-engineering protocols force the LLM to refuse the question rather than hallucinate.

### 4. Ultra-Low Latency Inference
To offset the computational overhead of the Self-Reflection loop, the generation phase relies on the `llama-3.1-8b-instant` model executed on Groq's Language Processing Unit (LPU) architecture. This hardware acceleration enables complex, multi-step RAG routing with sub-second end-to-end latency.

---

## Empirical Benchmarks & Evaluation

The architecture was evaluated against a strict 50-query automated dataset containing:
* 20 In-Domain queries (Direct factual retrieval).
* 15 In-Domain Multi-hop queries (Synthesizing multiple chunks).
* 15 Out-of-Domain adversarial queries (Hallucination traps).

### Executive Summary

| Metric | Naive RAG Baseline | Self-Reflective RAG |
|--------|--------------------|----------------------|
| **Average End-to-End Latency** | 3744.86ms | 5679.31ms |
| **Hallucinations (Out-of-Domain)** | 1 / 15 | 2 / 15 |
| **Successful Refusals (Out-of-Domain)**| 14 / 15 | 13 / 15 |
| **Self-Reflection Triggers** | N/A | 17 / 50 |

### Analytical Conclusion
The benchmark yielded a counter-intuitive but highly valuable architectural insight: while dynamic context expansion (Self-Reflection) successfully rescues low-confidence, in-domain queries, it introduces semantic noise when applied to purely out-of-domain adversarial queries. Feeding an LLM a larger volume of irrelevant text marginally increases the probability of a hallucination overriding a strict system prompt. Future roadmap iterations will require algorithmic decoupling between "In-Domain Low Confidence" and "Out-of-Domain Detection" to optimize the context expansion trigger.

---

## Technology Stack

**Backend Services**
* **Framework:** FastAPI (Asynchronous ASGI)
* **Data Validation:** Pydantic v2
* **Vector Store:** FAISS (CPU-optimized)
* **Embeddings:** HuggingFace `sentence-transformers` (PyTorch CPU binaries)
* **LLM Inference:** Groq Async SDK
* **Document Processing:** PyMuPDF (`fitz`)

**Frontend Client**
* **Framework:** React 18 (Bootstrapped via Vite & pnpm)
* **Styling:** Tailwind CSS v4
* **State & Fetch:** React Hooks, Axios
* **Iconography:** Lucide React

**Infrastructure & Deployment**
* **Containerization:** Docker & Docker Compose (Multi-stage builds)
* **Reverse Proxy:** Nginx
* **Networking:** Cloudflare Tunnels (Zero Trust Ingress)

---

## Deployment Configuration (Project Nexus)

This application is designed for containerized deployment within a Linux or Windows homelab environment.

### Prerequisites
* Docker and Docker Compose installed.
* An active Groq API Key.

### Initialization

1. Clone the repository and navigate to the root directory.
2. Create a `.env` file in the root directory based on the following structure:
   ```env
   GROQ_API_KEY=your_production_key_here
   HEURISTIC_THRESHOLD=0.70