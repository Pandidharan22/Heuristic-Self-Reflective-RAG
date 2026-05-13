import time
from fastapi import APIRouter
from app.models.schemas import QueryRequest, RAGResponse
from app.services.vector_service import vector_service
from app.services.heuristic_engine import heuristic_engine
from app.services.llm_service import llm_service

router = APIRouter()

@router.post("/ask", response_model=RAGResponse)
async def ask_question(request: QueryRequest):
    start_time = time.time()
    
    # 1. Initial Retrieval
    chunks, scores = await vector_service.search(request.query, request.top_k)
    
    # 2. Evaluate Heuristics
    metrics = heuristic_engine.evaluate_retrieval(scores)
    
    # 3. The Self-Healing Loop
    if metrics.self_healing_triggered:
        print(f"High Risk Detected (Risk: {metrics.final_risk}). Triggering Self-Healing...")
        # Expand the search net
        new_top_k = request.top_k + 3 
        chunks, scores = await vector_service.search(request.query, new_top_k)
        
        # Re-evaluate
        new_metrics = heuristic_engine.evaluate_retrieval(scores)
        
        # We adopt the new metrics, but ensure the frontend knows healing occurred
        metrics = new_metrics
        metrics.self_healing_triggered = True
        print(f"Self-Healing Complete. New Risk: {metrics.final_risk}")

    # 4. Generate LLM Response
    if not chunks:
        answer = "I don't have sufficient information in the provided documents."
    else:
        answer = await llm_service.generate_response(request.query, chunks)
    
    # Calculate Latency
    latency_ms = round((time.time() - start_time) * 1000, 2)
    
    return RAGResponse(
        answer=answer,
        metrics=metrics,
        retrieved_chunks=chunks,
        latency_ms=latency_ms
    )

@router.post("/ask_naive")
async def ask_question_naive(request: QueryRequest):
    """The Control Group: Standard RAG without self-healing or heuristics."""
    start_time = time.time()
    
    # 1. Blind Retrieval (Always takes exactly what FAISS gives it)
    chunks, scores = await vector_service.search(request.query, request.top_k)
    
    # 2. Blind Generation
    if not chunks:
        answer = "I don't have sufficient information in the provided documents."
    else:
        answer = await llm_service.generate_response(request.query, chunks)
    
    latency_ms = round((time.time() - start_time) * 1000, 2)
    
    # We return empty metrics since Naive RAG doesn't calculate them
    from app.models.schemas import HeuristicMetrics
    dummy_metrics = HeuristicMetrics(
        confidence_score=0.0, score_spread=0.0, base_risk=0.0, final_risk=0.0, self_healing_triggered=False
    )
    
    return RAGResponse(answer=answer, metrics=dummy_metrics, retrieved_chunks=chunks, latency_ms=latency_ms)