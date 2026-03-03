import uuid
from datetime import datetime

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import AiInterviewModerationEvent, AiInterviewReport, AiInterviewSession, AiInterviewTurn


async def persist_turn(db: AsyncSession, session_id: str, role: str, prompt: str | None, transcript: str | None, scores: dict | None, evidence: dict | None, turn_index: int) -> None:
    turn = AiInterviewTurn(
        id=str(uuid.uuid4()),
        session_id=session_id,
        turn_index=turn_index,
        role=role,
        prompt=prompt,
        transcript=transcript,
        scores_json=scores,
        evidence_refs=evidence,
    )
    try:
        db.add(turn)
        await db.commit()
    except Exception:
        await db.rollback()
        raise


async def resolve_mirrored_session_id(db: AsyncSession, external_session_id: str) -> str | None:
    """Return backend session id that points to this external session id (if any)."""
    result = await db.execute(
        text('SELECT id FROM ai_interview_sessions WHERE "externalSessionId" = :external LIMIT 1'),
        {"external": external_session_id},
    )
    row = result.first()
    return str(row[0]) if row and row[0] else None


async def ensure_session_links(db: AsyncSession, external_session_id: str) -> str | None:
    """Ensure the backend-mirrored session has externalSessionId set.

    Returns the mirrored backend session id if found.
    """
    mirrored = await resolve_mirrored_session_id(db, external_session_id)
    if mirrored:
        return mirrored
    result = await db.execute(
        text('SELECT id FROM ai_interview_sessions WHERE id = :id LIMIT 1'),
        {"id": external_session_id},
    )
    row = result.first()
    if row and row[0]:
        # This is the external session row itself.
        return None
    return None


async def update_session(
    db: AsyncSession,
    session_id: str,
    *,
    status: str | None = None,
    started_at: datetime | None = None,
    ended_at: datetime | None = None,
    warnings_count: int | None = None,
    termination_reason: str | None = None,
) -> None:
    record = await db.get(AiInterviewSession, session_id)
    if not record:
        return
    if status is not None:
        record.status = status
    if started_at is not None:
        record.started_at = started_at
    if ended_at is not None:
        record.ended_at = ended_at
    if warnings_count is not None:
        record.warnings_count = warnings_count
    if termination_reason is not None:
        record.termination_reason = termination_reason
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise


async def persist_moderation_event(
    db: AsyncSession,
    *,
    session_id: str,
    warning_level: int,
    reason: str,
    evidence_refs: dict | None,
) -> None:
    event = AiInterviewModerationEvent(
        id=str(uuid.uuid4()),
        session_id=session_id,
        warning_level=warning_level,
        reason=reason,
        evidence_refs=evidence_refs,
        created_at=datetime.utcnow(),
    )
    try:
        db.add(event)
        await db.commit()
    except Exception:
        await db.rollback()
        raise


async def clear_turns(db: AsyncSession, session_id: str) -> None:
    try:
        await db.execute(
            text("DELETE FROM ai_interview_turns WHERE session_id = :id"),
            {"id": session_id},
        )
        await db.commit()
    except Exception:
        await db.rollback()
        raise


async def clear_report(db: AsyncSession, session_id: str) -> None:
    try:
        await db.execute(
            text("DELETE FROM ai_interview_reports WHERE session_id = :id"),
            {"id": session_id},
        )
        await db.commit()
    except Exception:
        await db.rollback()
        raise


async def clear_session(db: AsyncSession, session_id: str) -> None:
    try:
        await db.execute(
            text("DELETE FROM ai_interview_sessions WHERE id = :id"),
            {"id": session_id},
        )
        await db.commit()
    except Exception:
        await db.rollback()
        raise


async def persist_report(db: AsyncSession, session_id: str, overall: int | None, dimensions: dict | None, summary: str | None, strengths: list | None, weaknesses: list | None, recommendations: list | None) -> None:
    report = AiInterviewReport(
        id=str(uuid.uuid4()),
        session_id=session_id,
        overall_score=overall,
        dimension_scores=dimensions,
        summary=summary,
        strengths=strengths,
        weaknesses=weaknesses,
        recommendations=recommendations,
    )
    try:
        db.add(report)
        await db.commit()
    except Exception:
        await db.rollback()
        raise
