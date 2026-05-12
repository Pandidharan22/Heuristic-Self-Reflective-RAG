import asyncio
from app.services.llm_service import llm_service

async def run_test():
    query = "What color is the sky?"
    dummy_context = ["The sky appears blue during the day due to Rayleigh scattering."]
    
    print("Sending request to Groq...")
    answer = await llm_service.generate_response(query, dummy_context)
    
    print("\n--- LLM Response ---")
    print(answer)

if __name__ == "__main__":
    # We use asyncio.run() because we are calling an async function from a synchronous script
    asyncio.run(run_test())