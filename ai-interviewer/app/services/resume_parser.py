from io import BytesIO
from ..config import settings
from .vector_store import upsert_resume_claims
from ..models import ResumeDocument


def _extract_pdf_text(file_bytes: bytes) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(BytesIO(file_bytes))
        parts: list[str] = []
        for page in reader.pages:
            parts.append(page.extract_text() or "")
        return "\n".join([p for p in parts if p]).strip()
    except Exception:
        return ""


def _extract_text_fallback(file_bytes: bytes) -> str:
    try:
        return (file_bytes or b"").decode("utf-8", errors="ignore").strip()
    except Exception:
        return ""


async def parse_resume(
    file_bytes: bytes,
    file_name: str,
    user_id: str,
    resume_id: str,
    db_session,
) -> ResumeDocument:
    doc_id = resume_id

    text = ""
    if (settings.llama_parse_api_key or "").strip():
        from llama_parse import LlamaParse
        parser = LlamaParse(api_key=settings.llama_parse_api_key)
        parsed = await parser.aload_data(file_bytes)
        text = "\n".join([p.text for p in parsed]) if parsed else ""
    elif (file_name or "").lower().endswith(".pdf"):
        text = _extract_pdf_text(file_bytes)
    else:
        # Local/dev fallback: handle text resumes.
        if (file_name or "").lower().endswith((".txt", ".md")):
            text = _extract_text_fallback(file_bytes)

    # Backend creates the resume_documents row first.
    # Here we upsert/update parsed_json + parse_status without failing on duplicates.
    existing = await db_session.get(ResumeDocument, doc_id)
    if existing:
        existing.user_id = user_id
        existing.file_name = file_name
        existing.file_type = file_name.split(".")[-1].lower() if "." in file_name else None
        existing.parse_status = "parsed" if text else (existing.parse_status or "pending")
        existing.parsed_json = {"raw_text": text} if text else (existing.parsed_json or {"raw_text": ""})
        resume = existing
    else:
        resume = ResumeDocument(
            id=doc_id,
            user_id=user_id,
            file_name=file_name,
            file_type=file_name.split(".")[-1].lower() if "." in file_name else None,
            parse_status="parsed" if text else "pending",
            parsed_json={"raw_text": text} if text else {"raw_text": ""},
        )
        db_session.add(resume)

    await db_session.commit()

    if text:
        await upsert_resume_claims(resume.id, text)
    return resume
