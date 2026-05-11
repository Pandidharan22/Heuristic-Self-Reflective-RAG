from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import chat

app = FastAPI(
    title="Self-Reflective RAG API",
    description = "Backend for heuristic based self-healing RAG system.",
    version="1.0.0")

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