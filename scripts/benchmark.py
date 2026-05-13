import httpx
import asyncio
import time

# The questions we are testing. 
# Notice how we mix easy questions, hard questions, and completely out-of-domain questions to trick the AI.
TEST_QUERIES = [
    "What is the architecture of the Transformer model?", # Easy, in context
    "Explain the multi-head attention mechanism mathematically.", # Hard, highly technical context
    "Who is the CEO of Apple?", # Out of domain - should trigger low confidence/refusal
    "How does GPT-4's performance compare to standard human baselines?", # In context (Sparks of AGI paper)
    "Give me a recipe for chocolate chip cookies." # Out of domain - hallucination trap
]

API_URL = "http://127.0.0.1:8000/api/ask"

async def run_benchmark():
    print("Starting Automated RAG Benchmark...")
    print("=" * 60)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for i, query in enumerate(TEST_QUERIES, 1):
            print(f"\n[Test {i}/5] Query: '{query}'")
            start_time = time.time()
            
            try:
                response = await client.post(API_URL, json={"query": query, "top_k": 3})
                response.raise_for_status()
                data = response.json()
                
                metrics = data.get("metrics", {})
                latency = data.get("latency_ms", 0)
                
                print(f"Latency: {latency}ms")
                print(f"Confidence: {metrics.get('confidence_score')} | Final Risk: {metrics.get('final_risk')}")
                
                if metrics.get('self_healing_triggered'):
                    print("Result: HIGH RISK -> Self-Healing Triggered")
                else:
                    print("Result: STABLE -> No Healing Needed")
                    
                print(f"AI Answer: {data.get('answer')[:150]}...") # Print first 150 chars
                
            except Exception as e:
                print(f"Error during request: {e}")
            
            print("-" * 60)
            await asyncio.sleep(1) # Small pause so we don't spam the Groq API too hard

if __name__ == "__main__":
    asyncio.run(run_benchmark())