from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Self-Reflective RAG API"
    GROQ_API_KEY: str = ""
    HEURISTIC_THRESHOLD: float = 0.70
    
    # Pydantic v2 syntax for loading .env files
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

# Global instance
settings = Settings()