# AI Interviewer Service

FastAPI service powering the AI Technical Interviewer module.

## Setup

```
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Environment

```
AI_INTERVIEW_ENVIRONMENT=development
AI_INTERVIEW_JWT_SECRET=dev-secret
AI_INTERVIEW_POSTGRES_DSN=postgresql+asyncpg://admin:password@localhost:5433/college_prep_db
AI_INTERVIEW_REDIS_URL=redis://localhost:6379/0
AI_INTERVIEW_QDRANT_URL=http://localhost:6333
AI_INTERVIEW_QDRANT_API_KEY=
AI_INTERVIEW_AZURE_OPENAI_ENDPOINT=
AI_INTERVIEW_AZURE_OPENAI_KEY=
AI_INTERVIEW_AZURE_OPENAI_API_VERSION=2024-05-01-preview
AI_INTERVIEW_AZURE_OPENAI_CHAT_DEPLOYMENT=gpt-4o-mini
AI_INTERVIEW_AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-small
AI_INTERVIEW_LLAMA_PARSE_API_KEY=
AI_INTERVIEW_INTERNAL_KEY=local-internal
```

## Run

```
uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```
