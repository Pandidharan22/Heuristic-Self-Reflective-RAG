from typing import List
from app.models.schemas import HeuristicMetrics
from app.core.config import settings

class HeuristicEngine:
    def __init__(self):
        # We load the threshold from our .env settings
        self.threshold = settings.HEURISTIC_THRESHOLD

    def evaluate_retrieval(self, similarity_scores: List[float], answer_length: int = 0, context_length: int = 0) -> HeuristicMetrics:
        """
        Calculates confidence and hallucination risk based on vector similarity scores.
        """
        if not similarity_scores:
            return self._default_failed_metrics()

        # 1. Calculate Confidence
        mean_sim = sum(similarity_scores) / len(similarity_scores)
        score_spread = max(similarity_scores) - min(similarity_scores)
        
        confidence = (0.7 * mean_sim) + (0.3 * score_spread)
        confidence = max(0.0, min(1.0, confidence)) # Bound between 0 and 1

        # 2. Calculate Base Risk (Inverted Quadratic)
        base_risk = (1.0 - confidence) ** 2

        # 3. Calculate Penalties
        # Low confidence penalty
        p_conf = 0.25 * (1.0 - confidence)
        
        # Spread penalty (penalize if the gap is too small, meaning chunks are equally mediocre)
        p_spread = 0.3 * max(0.0, 0.15 - score_spread)
        
        # Verbosity penalty (optional, used after generation if answer is too long compared to context)
        verbosity_ratio = (answer_length / context_length) if context_length > 0 else 0.0
        p_ratio = 0.2 * max(0.0, verbosity_ratio - 0.20) if answer_length > 0 else 0.0

        # 4. Final Risk Calculation
        final_risk = base_risk + p_conf + p_spread + p_ratio
        final_risk = max(0.0, min(1.0, final_risk)) # Bound between 0 and 1

        # 5. Trigger Decision
        trigger_healing = final_risk >= self.threshold

        return HeuristicMetrics(
            confidence_score=round(confidence, 4),
            score_spread=round(score_spread, 4),
            verbosity_ratio=round(verbosity_ratio, 4) if answer_length > 0 else None,
            base_risk=round(base_risk, 4),
            final_risk=round(final_risk, 4),
            self_healing_triggered=trigger_healing
        )

    def _default_failed_metrics(self) -> HeuristicMetrics:
        """Returns maximum risk if retrieval completely fails."""
        return HeuristicMetrics(
            confidence_score=0.0,
            score_spread=0.0,
            base_risk=1.0,
            final_risk=1.0,
            self_healing_triggered=True
        )

# Global instance
heuristic_engine = HeuristicEngine()