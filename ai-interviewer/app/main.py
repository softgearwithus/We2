from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, Header, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uuid
import re
from sqlalchemy import text  # pyright: ignore[reportMissingImports]
from .db import get_db, Base, engine
from .models import AiInterviewSession, AiInterviewTurn, AiInterviewReport
from .services.session_store import load_state, save_state
from .services.interview_engine import init_state, next_question, evaluate_answer, moderate_turn, generate_report
from .services.interview_store import (
    persist_turn,
    persist_report,
    persist_moderation_event,
    resolve_mirrored_session_id,
    update_session,
)
from .config import settings
from .services.resume_parser import parse_resume
from .security import decode_jwt


async def _update_session_and_mirror(
    db,
    external_session_id: str,
    *,
    status: str | None = None,
    started_at: datetime | None = None,
    ended_at: datetime | None = None,
    warnings_count: int | None = None,
    termination_reason: str | None = None,
) -> str | None:
    await update_session(
        db,
        external_session_id,
        status=status,
        started_at=started_at,
        ended_at=ended_at,
        warnings_count=warnings_count,
        termination_reason=termination_reason,
    )
    mirrored = await resolve_mirrored_session_id(db, external_session_id)
    if mirrored:
        await update_session(
            db,
            mirrored,
            status=status,
            started_at=started_at,
            ended_at=ended_at,
            warnings_count=warnings_count,
            termination_reason=termination_reason,
        )
    return mirrored


app = FastAPI(title="AI Interviewer")


@app.on_event("startup")
async def _startup() -> None:
    # Avoid schema drift/conflicts in production: the main backend owns migrations.
    # In local/dev, allow the service to bootstrap tables.
    if (settings.environment or "").lower() in {"production", "prod"}:
        return
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/ai-interview/sessions")
async def create_session(payload: dict, db=Depends(get_db), x_internal_key: str | None = Header(default=None)):
    if settings.internal_key and x_internal_key != settings.internal_key:
        raise HTTPException(status_code=401, detail="Unauthorized")
    session_id = str(uuid.uuid4())
    record = AiInterviewSession(
        id=session_id,
        interview_session_id=payload.get("interview_session_id"),
        user_id=payload.get("user_id"),
        resume_id=payload.get("resume_id"),
        status="scheduled",
        timer_seconds=900,
    )
    db.add(record)
    await db.commit()
    return {"session_id": session_id, "id": session_id}


@app.post("/ai-interview/sessions/{session_id}/start")
async def start_session(session_id: str, payload: dict, db=Depends(get_db), x_internal_key: str | None = Header(default=None)):
    if settings.internal_key and x_internal_key != settings.internal_key:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = payload.get("user_id") or "unknown"
    interview_session_id = payload.get("interview_session_id") or "unknown"
    state = init_state(user_id, interview_session_id)
    await save_state(session_id, state)
    await _update_session_and_mirror(db, session_id, status="in_progress", started_at=datetime.utcnow())
    return {"status": "started", "session_id": session_id, "remaining_seconds": 900}


@app.get("/ai-interview/sessions/{session_id}/report")
async def get_report(session_id: str, db=Depends(get_db), x_internal_key: str | None = Header(default=None)):
    if settings.internal_key and x_internal_key != settings.internal_key:
        raise HTTPException(status_code=401, detail="Unauthorized")
    result = await db.execute(
        text(
            'SELECT "overallScore", "dimensionScores", strengths, weaknesses, recommendations, summary '
            'FROM ai_interview_reports WHERE "sessionId" = CAST(:id AS uuid) LIMIT 1'
        ),
        {"id": session_id},
    )
    row = result.first()
    report = row if row else None
    if not report:
        raise HTTPException(status_code=404, detail="Report not ready")
    return {
        "session_id": session_id,
        "overall_score": report[0],
        "dimension_scores": report[1],
        "summary": report[5],
        "strengths": report[2],
        "weaknesses": report[3],
        "recommendations": report[4],
    }


@app.post("/ai-interview/resumes")
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    resume_id: str = Form(...),
    db=Depends(get_db),
    x_internal_key: str | None = Header(default=None),
):
    if settings.internal_key and x_internal_key != settings.internal_key:
        raise HTTPException(status_code=401, detail="Unauthorized")
    content = await file.read()
    resume = await parse_resume(content, file.filename or "resume.pdf", user_id, resume_id, db)
    return {"resume_id": resume.id, "status": resume.parse_status}


@app.websocket("/ai-interview/sessions/{session_id}/stream")
async def stream_session(websocket: WebSocket, session_id: str, db=Depends(get_db)):
    await websocket.accept()
    if not re.fullmatch(r"[0-9a-fA-F-]{32,36}", session_id):
        await websocket.send_json({"event": "session.terminated", "payload": {"reason": "invalid_session_id"}})
        await websocket.close()
        return
    state = await load_state(session_id)
    if not state:
        state = init_state("unknown", "unknown")
    try:
        mirrored_id: str | None = None
        while True:
            data = await websocket.receive_json()
            token = data.get("token")
            if settings.internal_key and token != settings.internal_key:
                try:
                    decode_jwt(token or "")
                except HTTPException:
                    await websocket.send_json({"event": "session.terminated", "payload": {"reason": "unauthorized"}})
                    await _update_session_and_mirror(
                        db,
                        session_id,
                        status="terminated",
                        ended_at=datetime.utcnow(),
                        termination_reason="unauthorized",
                    )
                    break
            transcript = data.get("transcript", "")
            if transcript == "[SESSION_START]":
                await websocket.send_json({"event": "session.started", "payload": {"remaining_seconds": state.get("remaining_seconds", 900)}})
                mirrored_id = await _update_session_and_mirror(db, session_id, status="in_progress", started_at=datetime.utcnow())
                intro = await next_question(state, "")
                await websocket.send_json({"event": "question.ask", "payload": intro})
                await save_state(session_id, state)
                continue
            if transcript == "[SESSION_END]":
                await websocket.send_json({"event": "session.ended", "payload": {"reason": "client_end"}})
                await _update_session_and_mirror(db, session_id, status="completed", ended_at=datetime.utcnow())
                report = await generate_report(state)
                await persist_report(
                    db,
                    session_id=session_id,
                    overall=state.get("latest_overall"),
                    dimensions=state.get("dimensions"),
                    summary=report.get("summary") if isinstance(report, dict) else "Interview completed.",
                    strengths=report.get("strengths") if isinstance(report, dict) else (state.get("strengths") or []),
                    weaknesses=report.get("weaknesses") if isinstance(report, dict) else (state.get("weaknesses") or []),
                    recommendations=report.get("recommendations") if isinstance(report, dict) else (state.get("recommendations") or []),
                )
                await save_state(session_id, state)
                break
            moderation = await moderate_turn(transcript, data.get("signals", {}))
            lvl = moderation.get("warning_level")
            try:
                lvl_int = int(lvl) if lvl is not None else 0
            except Exception:
                lvl_int = 0
            flagged = bool(moderation.get("flagged") or moderation.get("terminate") or lvl_int >= 1)
            if flagged:
                state["warnings"] = state.get("warnings", 0) + 1
                await _update_session_and_mirror(
                    db,
                    session_id,
                    warnings_count=int(state["warnings"]),
                    termination_reason="misconduct" if int(state["warnings"]) >= 3 else None,
                )
                # Persist immediately so warnings aren't lost on disconnect.
                await save_state(session_id, state)
                try:
                    persist_id = mirrored_id or (await resolve_mirrored_session_id(db, session_id)) or session_id
                    await persist_moderation_event(
                        db,
                        session_id=persist_id,
                        warning_level=int(state["warnings"]),
                        reason=str(moderation.get("reason") or "policy_violation"),
                        evidence_refs=moderation if isinstance(moderation, dict) else None,
                    )
                except Exception:
                    # Do not fail the interview loop if persistence fails.
                    pass
                await websocket.send_json(
                    {
                        "event": "moderation.warning",
                        "payload": {**moderation, "warning_level": state["warnings"]},
                    }
                )
                if state["warnings"] >= 3:
                    await websocket.send_json({"event": "session.terminated", "payload": {"reason": "misconduct"}})
                    await _update_session_and_mirror(
                        db,
                        session_id,
                        status="terminated",
                        ended_at=datetime.utcnow(),
                        warnings_count=int(state["warnings"]),
                        termination_reason="misconduct",
                    )
                    report = await generate_report(state)
                    await persist_report(
                        db,
                        session_id=session_id,
                        overall=state.get("latest_overall"),
                        dimensions=state.get("dimensions"),
                        summary=report.get("summary") if isinstance(report, dict) else "Session terminated due to misconduct.",
                        strengths=report.get("strengths") if isinstance(report, dict) else (state.get("strengths") or []),
                        weaknesses=report.get("weaknesses") if isinstance(report, dict) else (state.get("weaknesses") or []),
                        recommendations=report.get("recommendations") if isinstance(report, dict) else (state.get("recommendations") or []),
                    )
                    break

            question = await next_question(state, transcript)
            score = await evaluate_answer(question.get("question", ""), transcript)
            try:
                await persist_turn(
                    db,
                    session_id=session_id,
                    role="user",
                    prompt=question.get("question"),
                    transcript=transcript,
                    scores=score if isinstance(score, dict) else None,
                    evidence=moderation if isinstance(moderation, dict) else None,
                    turn_index=int(state.get("turn_index", 0)),
                )
                state["turn_index"] = int(state.get("turn_index", 0)) + 1
            except Exception:
                # Do not fail the interview loop if persistence fails.
                pass
            state["coverage"] = state.get("coverage", {})
            if isinstance(score, dict):
                state["latest_overall"] = score.get("overall") or state.get("latest_overall")
                state["dimensions"] = score.get("scores") or state.get("dimensions") or state.get("dimensions")
                flags = score.get("flags") or []
                if isinstance(flags, list):
                    strengths = [f for f in flags if isinstance(f, str) and f.startswith("strength:")]
                    weaknesses = [f for f in flags if isinstance(f, str) and f.startswith("weakness:")]
                    if strengths:
                        state["strengths"] = [s.replace("strength:", "").strip() for s in strengths]
                    if weaknesses:
                        state["weaknesses"] = [w.replace("weakness:", "").strip() for w in weaknesses]
            await websocket.send_json({"event": "question.ask", "payload": question})
            await websocket.send_json({"event": "score.update", "payload": score})
            await save_state(session_id, state)
    except WebSocketDisconnect:
        return
