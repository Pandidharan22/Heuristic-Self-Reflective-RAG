import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import chat
from app.services.vector_service import vector_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up server...")
    
    # Try to load existing database from disk first!
    if not vector_service.load():
        print("No existing vector store found. Starting ingestion...")
        raw_dir = "app/data/raw"
        if os.path.exists(raw_dir):
            pdf_files = [f for f in os.listdir(raw_dir) if f.endswith(".pdf")]
            for file in pdf_files:
                print(f"Loading {file} into Vector Store...")
                vector_service.ingest_pdf(os.path.join(raw_dir, file))
    else:
        print("Skipping ingestion. Database loaded instantly from disk.")
        
    yield 
    
    print("Shutting down server...")

app = FastAPI(
    title="Self-Reflective RAG API",
    description = "Backend for heuristic based self-healing RAG system.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "Online",
            "message": "API is ready"
            }

app.include_router(chat.router, prefix="/api", tags=["Chat"])