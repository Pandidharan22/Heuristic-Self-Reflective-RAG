import os
from groq import AsyncGroq
from app.core.config import settings

class LLMService:
    def __init__(self):
        # Initialize the async Groq client
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is missing from the .env file!")
        
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        # We use Llama 3 8B because it is lightning fast and highly capable
        self.model = "llama-3.1-8b-instant"
        
        self.system_prompt = (
            "You are an expert AI assistant. Answer the user's QUESTION "
            "based strictly on the provided CONTEXT. "
            "If the answer is not in the context, say 'I don't have sufficient information'. "
            "Do not hallucinate external facts."
        )

    async def generate_response(self, query: str, retrieved_chunks: list[str]) -> str:
        """Sends the context and query to Groq and returns the generated answer."""
        
        # Format the context into a single readable block
        context_block = "\n\n".join([f"--- Chunk {i+1} ---\n{chunk}" for i, chunk in enumerate(retrieved_chunks)])
        
        user_message = f"CONTEXT:\n{context_block}\n\nQUESTION:\n{query}"

        try:
            # We use await because this is an I/O bound network request
            chat_completion = await self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_message}
                ],
                model=self.model,
                temperature=0.2, # Low temperature for factual RAG
                max_tokens=500
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"LLM Generation Error: {e}")
            return "Error: Failed to generate response from LLM."

# Global instance
llm_service = LLMService()