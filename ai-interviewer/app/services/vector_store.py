import uuid
from qdrant_client import QdrantClient
from qdrant_client.http.models import PointStruct, VectorParams, Distance
from .embeddings import embed_text
from ..config import settings


async def upsert_resume_claims(resume_id: str, text: str) -> None:
    client = QdrantClient(url=settings.qdrant_url, api_key=(settings.qdrant_api_key or None))
    collection = settings.qdrant_collection

    # Keep vector size aligned with the chosen embedding model.
    vector_size = 1536 if settings.azure_openai_embedding_deployment == "text-embedding-3-small" else 3072

    if collection not in [c.name for c in client.get_collections().collections]:
        client.create_collection(
            collection_name=collection,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
        )

    chunks = [text[i:i + 1200] for i in range(0, len(text), 1200)]
    points = []
    for chunk in chunks:
        vector = await embed_text(chunk)
        points.append(
            PointStruct(
                id=str(uuid.uuid4()),
                vector=vector,
                payload={"resume_id": resume_id, "text": chunk},
            )
        )

    if points:
        client.upsert(collection_name=collection, points=points)
