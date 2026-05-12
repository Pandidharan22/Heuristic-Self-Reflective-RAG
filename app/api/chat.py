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