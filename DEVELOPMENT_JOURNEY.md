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

## Phase 2: Heuristic Guardrail Engine

### Actions Taken
* Implemented the `HeuristicEngine` service (`app/services/heuristic_engine.py`).
* Translated the theoretical math formula (mean similarity, score spread, quadratic base risk, and proportional penalties) into a robust, testable Python class.
* Integrated the environment configuration to allow dynamic tuning of the `HEURISTIC_THRESHOLD`.
* Successfully unit-tested the engine against "Good Retrieval" and "Bad Retrieval" scenarios, verifying that it correctly bounds risks between 0 and 1, and accurately triggers the self-healing flag when risk exceeds the threshold.

### Key Learnings
* **Separation of Concerns:** By isolating the math logic into its own service class, we made the code highly testable without needing to boot up the entire FastAPI server or make expensive calls to the vector database.
* **Deterministic Guardrails:** Proved that heuristic bounds mathematically prevent edge cases (like negative risks or risks > 1.0) from breaking the pipeline.

## Phase 2: LLM Service & Groq Integration

### Actions Taken
* Created `app/services/llm_service.py` to handle communication with the LLM.
* Integrated the `groq` async SDK to leverage LPU (Language Processing Unit) hardware for ultra-fast text generation.
* Resolved a transitive dependency conflict by pinning `httpx==0.27.2`.
* Migrated from the deprecated `llama3-8b-8192` model to the industry-current `llama-3.1-8b-instant` model.
* Engineered a strict System Prompt forcing the LLM to rely *only* on provided context and to refuse answers when context is lacking.
* Successfully tested the asynchronous generation using a dummy context vector.

### Key Learnings
* **Transitive Dependencies:** Learned that pinning top-level libraries isn't always enough; sub-dependencies (like `httpx` inside `groq`) can break builds if their APIs change.
* **Model Lifecycles:** AI models deprecate rapidly. Staying aware of provider updates (like Groq's shift to Llama 3.1) is a mandatory maintenance task for AI Engineers.

## Phase 3: System Integration & Data Persistence

### Actions Taken
* Upgraded the `VectorService` to support persistent storage, saving the FAISS index (`.faiss`) and chunk metadata (`.json`) directly to the disk.
* Leveraged FastAPI's `@asynccontextmanager` `lifespan` event to execute database loading/ingestion automatically during server boot-up.
* Wired the Vector Database, Heuristic Engine, and Groq LLM together inside the `/api/ask` endpoint.
* Implemented the "Self-Healing Loop": The endpoint dynamically checks the heuristic risk score and autonomously expands the `top_k` search parameters if the risk exceeds the configured threshold.
* Successfully executed an end-to-end integration test via cURL, achieving a highly performant sub-700ms response time.

### Key Learnings
* **State Persistence:** In-memory databases are volatile. Writing state to disk and loading it during the application's lifespan is mandatory to prevent massive cold-start delays.
* **Orchestration:** Learned how to seamlessly chain I/O-bound tasks (LLM calls), CPU-bound tasks (FAISS), and synchronous logic (Heuristics) together within a single asynchronous API route without blocking the event loop.

## Phase 4: Frontend Bootstrapping & Optimization

### Actions Taken
* Migrated package management from standard `npm` to `pnpm` to optimize disk space usage via global store hard-linking and to drastically improve installation speeds.
* Bootstrapped a modern React application using Vite (`pnpm create vite`), establishing a lightning-fast Hot Module Replacement (HMR) development environment.
* Installed core frontend dependencies: `axios` for asynchronous HTTP requests to the FastAPI backend, and `lucide-react` for professional, scalable SVG iconography.
* Updated the root `.gitignore` to secure frontend environments and prevent the `node_modules` folder from bloating the source control repository.

### Key Learnings
* **Package Management Efficiency:** Standard `npm` duplicates dependencies across projects. `pnpm` solves this architectural inefficiency, which is a crucial workflow upgrade for Full Stack developers.
* **Vite vs Create React App:** Vite relies on native ES modules, making server start times and file updates nearly instantaneous compared to legacy Webpack-based bundlers.