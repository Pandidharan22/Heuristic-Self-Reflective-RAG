from app.services.heuristic_engine import heuristic_engine

def run_tests():
    print(f"Current Threshold: {heuristic_engine.threshold}")
    print("-" * 30)
    
    # Scenario 1: Great Retrieval (High scores, decent spread)
    good_scores = [0.85, 0.80, 0.78, 0.75, 0.70]
    metrics_good = heuristic_engine.evaluate_retrieval(good_scores)
    print("SCENARIO 1: Good Retrieval")
    print(f"Final Risk: {metrics_good.final_risk}")
    print(f"Trigger Self-Healing? {metrics_good.self_healing_triggered}\n")

    # Scenario 2: Terrible Retrieval (Low scores, flat spread)
    bad_scores = [0.35, 0.34, 0.34, 0.33, 0.32]
    metrics_bad = heuristic_engine.evaluate_retrieval(bad_scores)
    print("SCENARIO 2: Bad Retrieval")
    print(f"Final Risk: {metrics_bad.final_risk}")
    print(f"Trigger Self-Healing? {metrics_bad.self_healing_triggered}\n")

if __name__ == "__main__":
    run_tests()