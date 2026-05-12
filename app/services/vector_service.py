import os
import json
import asyncio
import faiss
import numpy as np
import fitz  # PyMuPDF
from sentence_transformers import SentenceTransformer

class VectorService:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.index = None
        self.chunks = []
        os.makedirs("app/data/vector_store", exist_ok=True)
        self.index_path = "app/data/vector_store/index.faiss"
        self.chunks_path = "app/data/vector_store/chunks.json" # We need this to map vectors back to text

    def save(self):
        """Saves the FAISS index and chunk metadata to disk."""
        if self.index is not None:
            faiss.write_index(self.index, self.index_path)
            with open(self.chunks_path, "w", encoding="utf-8") as f:
                json.dump(self.chunks, f)
            print("Vector Store saved to disk.")

    def load(self) -> bool:
        """Loads the FAISS index and chunks from disk if they exist."""
        if os.path.exists(self.index_path) and os.path.exists(self.chunks_path):
            self.index = faiss.read_index(self.index_path)
            with open(self.chunks_path, "r", encoding="utf-8") as f:
                self.chunks = json.load(f)
            print(f"Loaded Vector Store from disk ({len(self.chunks)} chunks).")
            return True
        return False

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

        new_chunks = [text[i:i+500] for i in range(0, len(text), 450)]
        self.chunks.extend(new_chunks)

        embeddings = self.model.encode(new_chunks, convert_to_numpy=True)
        
        dimension = embeddings.shape[1]
        if self.index is None:
            self.index = faiss.IndexFlatIP(dimension)
        
        self.index.add(np.array(embeddings).astype("float32"))
        print(f"Ingested {len(new_chunks)} chunks from {os.path.basename(file_path)}")
        
        # ACTUALLY SAVE TO DISK NOW
        self.save()

    async def search(self, query: str, top_k: int):
        return await asyncio.to_thread(self._sync_search, query, top_k)

    def _sync_search(self, query: str, top_k: int):
        if self.index is None or not self.chunks:
            return [], []
        
        query_embedding = self.model.encode([query], convert_to_numpy=True)
        scores, indices = self.index.search(np.array(query_embedding).astype("float32"), top_k)
        
        results = [self.chunks[i] for i in indices[0] if i != -1]
        return results, scores[0].tolist()

vector_service = VectorService()