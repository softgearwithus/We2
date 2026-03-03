import uuid
from datetime import datetime
from ..llm import chat_json
from ..prompts import INTERVIEWER_SYSTEM, EVALUATOR_SYSTEM, MODERATION_SYSTEM, REPORT_SYSTEM


async def next_question(state: dict, last_answer: str) -> dict:
    payload = {
        "state": state,
        "last_answer": last_answer,
    }
    return await chat_json(INTERVIEWER_SYSTEM, f"Context: {payload}")


async def evaluate_answer(question: str, answer: str) -> dict:
    payload = {"question": question, "answer": answer}
    result = await chat_json(EVALUATOR_SYSTEM, f"Answer: {payload}")
    # Normalize into UI-friendly dimensions.
    if isinstance(result, dict) and "scores" in result:
        scores = result.get("scores") or {}

        # If the model returns rubric subscores, map them into the 3 UI dimensions.
        if any(k in scores for k in ["depth", "correctness", "specificity", "reasoning", "communication"]):
            def _num(v):
                return v if isinstance(v, (int, float)) else None

            depth = _num(scores.get("depth"))
            correctness = _num(scores.get("correctness"))
            specificity = _num(scores.get("specificity"))
            reasoning = _num(scores.get("reasoning"))
            communication = _num(scores.get("communication"))

            tech_parts = [v for v in [depth, correctness, specificity, reasoning] if isinstance(v, (int, float))]
            technical = int(round(sum(tech_parts) / len(tech_parts))) if tech_parts else None
            problem_solving = int(round(reasoning)) if isinstance(reasoning, (int, float)) else (technical or 0)
            comm = int(round(communication)) if isinstance(communication, (int, float)) else 0

            result["scores"] = {
                "technical": technical or 0,
                "communication": comm,
                "problemSolving": problem_solving,
            }

        dims = result.get("scores") or {}
        total = 0
        count = 0
        for key in ["technical", "communication", "problemSolving"]:
            if isinstance(dims.get(key), (int, float)):
                total += dims[key]
                count += 1
        if count:
            result["overall"] = int(round(total / count))
    return result


async def moderate_turn(transcript: str, signals: dict) -> dict:
    payload = {"transcript": transcript, "signals": signals}
    result = await chat_json(MODERATION_SYSTEM, f"Input: {payload}")
    # Be resilient to different schema variants.
    if isinstance(result, dict):
        flagged = bool(result.get("flagged") or result.get("terminate"))
        if "warning_level" not in result:
            result["warning_level"] = 1 if flagged else 0
        if "flagged" not in result:
            result["flagged"] = flagged
    return result


async def generate_report(state: dict) -> dict:
    payload = {
        "coverage": state.get("coverage"),
        "latest_overall": state.get("latest_overall"),
        "dimensions": state.get("dimensions"),
    }
    return await chat_json(REPORT_SYSTEM, f"Summary: {payload}")


def init_state(user_id: str, interview_session_id: str) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "interview_session_id": interview_session_id,
        "status": "in_progress",
        "warnings": 0,
        "coverage": {"fundamentals": 0, "projects": 0, "problem_solving": 0, "communication": 0},
        "started_at": datetime.utcnow().isoformat(),
        "remaining_seconds": 900,
    }
