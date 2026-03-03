from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="AI_INTERVIEW_",
        env_file=str(Path(__file__).resolve().parents[1] / ".env"),
        extra="ignore",
    )

    environment: str = "development"
    jwt_secret: str = "dev-secret"
    postgres_dsn: str = "postgresql+asyncpg://admin:password@localhost:5433/college_prep_db"
    redis_url: str = "redis://localhost:6379/0"
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""
    qdrant_collection: str = "resume_claims"
    azure_openai_endpoint: str = ""
    azure_openai_key: str = ""
    azure_openai_api_version: str = "2024-05-01-preview"
    azure_openai_chat_deployment: str = "gpt-4o-mini"
    azure_openai_embedding_deployment: str = "text-embedding-3-small"
    llama_parse_api_key: str = ""
    blob_container: str = "resumes"
    internal_key: str = "local-internal"


settings = Settings()
