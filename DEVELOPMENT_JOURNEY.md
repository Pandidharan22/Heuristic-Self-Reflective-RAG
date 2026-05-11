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

## Phase 1: FastAPI Foundation & Server Initialization
**Date:** [Insert Today's Date]

### Actions Taken
* Created the entry point for the application (`app/main.py`).
* Instantiated the FastAPI app with basic metadata.
* Configured Cross-Origin Resource Sharing (CORS) middleware to allow future frontend integration.
* Built a `/health` endpoint to verify server status.
* Successfully launched the local Uvicorn ASGI server and verified the interactive Swagger UI documentation at `/docs`.

### Key Learnings
* **CORS:** Cross-Origin Resource Sharing is a critical security feature in browsers. Configuring it explicitly on the backend is mandatory for a decoupled React frontend to communicate with the API.