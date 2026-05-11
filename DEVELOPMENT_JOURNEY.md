# Self-Reflective RAG: Development Journal

## Phase 1: Environment Setup & Source Control

### Actions Taken
* Designed a Domain-Driven folder structure (`app/api`, `app/core`, `app/services`, `app/models`, `app/data`) for a scalable FastAPI application.
* Initialized an isolated Python virtual environment (`.venv`).
* Created `requirements.txt` and installed modern, production-grade dependencies: `fastapi`, `faiss-cpu`, `PyMuPDF` (for fast document ingestion), and `groq` for LLM inference.
* Configured Git source control and created a secure `.gitignore` to prevent tracking of the virtual environment (`.venv/`), `__pycache__`, large FAISS indexes, and secret `.env` files.

### Key Learnings
* **`__init__.py`:** Acts as a badge of identity, telling Python to treat a directory as an importable package.
* **Sync vs Async in FastAPI:** Learned the crucial difference between `async def` (for I/O-bound tasks like API calls) and standard `def` (for CPU-bound tasks like FAISS mathematical searches). Using standard `def` for FAISS in FastAPI ensures it runs in a separate threadpool, preventing it from blocking the main asynchronous event loop.
* **Source Control Security:** Always ignore environment folders and `.env` files to prevent committing massive binaries or sensitive API keys to GitHub.