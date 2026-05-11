from fastapi import APIRouter
from app.models.schemas import QueryRequest, RAGResponse, HeuristicMetrics

router = APIRouter()

@router.post("/ask", response_model=RAGResponse)
async def ask_question(request: QueryRequest):
    # This is a dummy response. We will replace this with real logic in Phase 2.
    metrics = HeuristicMetrics(
        confidence_score=0.85,
        score_spread=0.1,
        base_risk=0.02,
        final_risk=0.05,
        self_healing_triggered=False
    )
    
    return RAGResponse(
        answer=f"You asked: '{request.query}'. I will have a real answer soon!",
        metrics=metrics,
        retrieved_chunks=["chunk_1", "chunk_2"],
        latency_ms=120.5
    )