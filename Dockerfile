# /Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for FAISS and PyMuPDF
RUN apt-get update && apt-get install -y build-essential libopenblas-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Ensure data directories exist for volume mounting
RUN mkdir -p app/data/vector_store app/data/raw

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]