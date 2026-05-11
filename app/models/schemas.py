from pydantic import BaseModel, Field
from typing import List, Optional

class QueryRequest(BaseModel):
    query: str = Field(..., description="The user's question.")
    top_k: int = Field(5, description="Number of initial chunks to retrieve.")

class HeuristicMetrics(BaseModel):
    confidence_score: float
    score_spread: float
    verbosity_ratio: Optional[float] = None
    base_risk: float
    final_risk: float
    self_healing_triggered: bool

class RAGResponse(BaseModel):
    answer: str
    metrics: HeuristicMetrics
    retrieved_chunks: List[str]
    latency_ms: float