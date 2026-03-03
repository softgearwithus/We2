import json
from redis.asyncio import Redis
from ..config import settings


def _redis() -> Redis:
    return Redis.from_url(settings.redis_url, decode_responses=True)


async def load_state(session_id: str) -> dict:
    client = _redis()
    raw = await client.get(f"ai_session:{session_id}")
    return json.loads(raw) if raw else {}


async def save_state(session_id: str, state: dict) -> None:
    client = _redis()
    await client.set(f"ai_session:{session_id}", json.dumps(state), ex=3600)
