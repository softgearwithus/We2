from urllib.parse import urlparse
import hashlib

from openai import AsyncAzureOpenAI
from ..config import settings


def _normalize_azure_endpoint(endpoint: str) -> str:
    value = (endpoint or "").strip()
    if not value:
        return value
    parsed = urlparse(value)
    if parsed.scheme and parsed.netloc:
        return f"{parsed.scheme}://{parsed.netloc}"
    return value.rstrip("/")


def _client() -> AsyncAzureOpenAI:
    return AsyncAzureOpenAI(
        api_key=settings.azure_openai_key,
        api_version=settings.azure_openai_api_version,
        azure_endpoint=_normalize_azure_endpoint(settings.azure_openai_endpoint),
    )


def _fallback_embedding(text: str, size: int) -> list[float]:
    """Local/dev fallback when Azure OpenAI isn't configured.

    Produces a deterministic vector so Qdrant upserts work without external calls.
    """

    digest = hashlib.sha256((text or "").encode("utf-8", errors="ignore")).digest()
    out: list[float] = []
    # Expand digest bytes into [-1, 1] floats.
    while len(out) < size:
        for b in digest:
            out.append((b / 127.5) - 1.0)
            if len(out) >= size:
                break
        # Re-hash to avoid repeating the same 32 bytes pattern forever.
        digest = hashlib.sha256(digest).digest()
    return out


async def embed_text(text: str) -> list:
    endpoint = (settings.azure_openai_endpoint or "").strip()
    key = (settings.azure_openai_key or "").strip()
    size = 1536 if settings.azure_openai_embedding_deployment == "text-embedding-3-small" else 3072

    if not endpoint or not key:
        return _fallback_embedding(text, size)

    try:
        client = _client()
        resp = await client.embeddings.create(
            model=settings.azure_openai_embedding_deployment,
            input=text,
        )
        return resp.data[0].embedding
    except Exception:
        # Local-first: don't fail resume parsing on embedding connectivity issues.
        return _fallback_embedding(text, size)
