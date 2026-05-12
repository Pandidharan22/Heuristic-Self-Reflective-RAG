from app.services.vector_service import vector_service
import os

def test():
    # Find the first PDF in your data/raw folder
    raw_dir = "app/data/raw"
    pdf_files = [f for f in os.listdir(raw_dir) if f.endswith('.pdf')]
    
    if not pdf_files:
        print("No PDF found! Please put a PDF in app/data/raw/")
        return

    path = os.path.join(raw_dir, pdf_files[0])
    vector_service.ingest_pdf(path)
    
    results, scores = vector_service._sync_search("What is a transformer?", top_k=2)
    print(f"Search Results: {len(results)}")
    if results:
        print(f"Top Result Score: {scores[0]}")
        print(f"Snippet: {results[0][:100]}...")

if __name__ == "__main__":
    test()