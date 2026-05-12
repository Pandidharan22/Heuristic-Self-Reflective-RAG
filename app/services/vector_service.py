import os
import asyncio
import faiss
import numpy as np
import fitz  # PyMuPDF
from sentence_transformers import SentenceTransformer

class VectorService:
    def __init__(self):
        # Load the embedding model
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.index = None
        self.chunks = []
        # Ensure the directory exists
        os.makedirs("app/data/vector_store", exist_ok=True)
        self.index_path = "app/data/vector_store/index.faiss"

    def ingest_pdf(self, file_path: str):
        """Extract text from PDF, chunk it, and add to FAISS index."""
        if not os.path.exists(file_path):
            print(f"Error: File {file_path} not found.")
            return

        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()

        if not text.strip():
            print(f"Warning: No text extracted from {file_path}")
            return

        # Simple Chunking (500 characters with 50 overlap)
        new_chunks = [text[i:i+500] for i in range(0, len(text), 450)]
        self.chunks.extend(new_chunks)

        # Force embeddings to be a NumPy array so we can access .shape
        embeddings = self.model.encode(new_chunks, convert_to_numpy=True)
        
        # Initialize or add to FAISS index
        dimension = embeddings.shape[1]
        if self.index is None:
            # IndexFlatIP uses Inner Product (Cosine Similarity if normalized)
            self.index = faiss.IndexFlatIP(dimension)
        
        # Add to index (cast to float32 as required by FAISS)
        self.index.add(np.array(embeddings).astype("float32"))
        print(f"Ingested {len(new_chunks)} chunks from {os.path.basename(file_path)}")

    async def search(self, query: str, top_k: int):
        """Perform search in a threadpool to avoid blocking the event loop."""
        return await asyncio.to_thread(self._sync_search, query, top_k)

    def _sync_search(self, query: str, top_k: int):
        if self.index is None or not self.chunks:
            return [], []
        
        query_embedding = self.model.encode([query], convert_to_numpy=True)
        # scores: similarity values, indices: position of the chunks
        scores, indices = self.index.search(np.array(query_embedding).astype("float32"), top_k)
        
        results = [self.chunks[i] for i in indices[0] if i != -1]
        return results, scores[0].tolist()

# Global instance
vector_service = VectorService()