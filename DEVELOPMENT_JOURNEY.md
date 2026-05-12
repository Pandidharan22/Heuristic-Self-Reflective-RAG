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

### Actions Taken
* Created the entry point for the application (`app/main.py`).
* Instantiated the FastAPI app with basic metadata.
* Configured Cross-Origin Resource Sharing (CORS) middleware to allow future frontend integration.
* Built a `/health` endpoint to verify server status.
* Successfully launched the local Uvicorn ASGI server and verified the interactive Swagger UI documentation at `/docs`.

### Key Learnings
* **CORS:** Cross-Origin Resource Sharing is a critical security feature in browsers. Configuring it explicitly on the backend is mandatory for a decoupled React frontend to communicate with the API.

## Phase 1: Configuration, Data Schemas, and API Contract

### Actions Taken
* Implemented a secure configuration management system using `pydantic-settings` to load environment variables from a `.env` file.
* Defined strict data models using Pydantic `BaseModel` to enforce the "API Contract" (ensuring input and output data structures are always valid).
* Created a modular `APIRouter` for chat operations and integrated it into the main FastAPI application.
* Built a placeholder `/api/ask` endpoint that successfully simulates the heuristic-based RAG response.

### Key Learnings
* **Pydantic Validation:** Learned how `Field` and type hints in Pydantic prevent "garbage in, garbage out" by automatically validating request bodies.
* **Environment Management:** Separating secrets (API keys) from code using `.env` and a settings singleton is essential for production security.
* **Modular Routing:** Using `app.include_router` allows the application to stay organized as it grows, separating the server startup logic from specific business features like "Chat."

## Phase 2: Vector Service & PyMuPDF Integration
**Date:** May 12, 2026

### Actions Taken
* Downgraded NumPy to `<2.0.0` in `requirements.txt` to resolve a C-API compilation conflict with the `faiss-cpu` library.
* Implemented `app/services/vector_service.py` as a Singleton class to hold the FAISS index and embedding model in memory.
* Integrated `PyMuPDF` (`fitz`) for rapid extraction of text from PDF documents.
* Built the text chunking and embedding pipeline using `sentence-transformers` (`all-MiniLM-L6-v2`).
* Wrapped the synchronous, CPU-bound FAISS `.search()` method in an asynchronous `asyncio.to_thread()` wrapper to ensure the FastAPI event loop remains unblocked during heavy vector calculations.
* Successfully ingested "Attention Is All You Need.pdf" and performed a vector similarity search.

### Key Learnings
* **Dependency Hell:** Learned that major version bumps in low-level libraries (like NumPy 2.0) can break pre-compiled C++ libraries (like FAISS). Pinning dependency versions in `requirements.txt` is critical for stability.
* **Threadpooling in AsyncIO:** Reconfirmed the pattern of using `asyncio.to_thread()` to safely execute heavy mathematical operations in an asynchronous web framework.