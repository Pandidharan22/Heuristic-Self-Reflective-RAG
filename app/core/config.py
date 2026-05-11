from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Heuristic Self-Reflective RAG"
    VERSION: str = "1.0.0"
    GROQ_API_KEY: str = ""
    HEURISTIC_THRESHOLD: float = 0.70

    class config:
        env_file = ".env"

settings = Settings()