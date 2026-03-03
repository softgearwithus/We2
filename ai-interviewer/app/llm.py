import json
from urllib.parse import urlparse

from openai import AsyncAzureOpenAI
from .config import settings


def _has_azure_config() -> bool:
    return bool((settings.azure_openai_key or "").strip() and (settings.azure_openai_endpoint or "").strip())


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


async def chat_json(system_prompt: str, user_prompt: str) -> dict:
    # Local-first dev mode: allow the service to run without Azure OpenAI configured.
    if not _has_azure_config():
        sp = (system_prompt or "").lower()
        up = (user_prompt or "").lower()
        if "moderation" in sp:
            bad = any(k in up for k in ["cheat", "google", "answer for me", "copy paste", "plagiar"])
            return {
                "warning_level": 1 if bad else 0,
                "reason": "Possible misconduct detected" if bad else "OK",
                "terminate": bool(bad),
                "flagged": bool(bad),
            }
        if "evaluator" in sp:
            # Keep the shape stable for downstream mapping.
            base = 72
            comm = 70 if len(up) < 600 else 78
            reasoning = 68 if "because" not in up else 76
            technical = int(round((base + reasoning) / 2))
            return {
                "scores": {
                    "technical": technical,
                    "communication": comm,
                    "problemSolving": reasoning,
                },
                "overall": int(round((technical + comm + reasoning) / 3)),
                "rationale": "Local fallback scoring (no Azure OpenAI configured).",
                "flags": ["strength:clear structure" if comm >= 75 else "weakness:needs more detail"],
            }
        if "report generator" in sp or "report" in sp:
            return {
                "summary": "Interview completed (local fallback report).",
                "strengths": ["Communicated clearly"],
                "weaknesses": ["Add more specific examples"],
                "recommendations": ["Practice explaining tradeoffs and edge cases"],
            }
        # interviewer
        return {
            "question": "Walk me through a backend project you built recently. Focus on architecture, data model, and tradeoffs.",
            "skill_tags": ["projects", "architecture"],
            "expected_depth": "2-4 minutes with concrete details",
        }

    client = _client()
    response = await client.chat.completions.create(
        model=settings.azure_openai_chat_deployment,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2,
        max_tokens=800,
        response_format={"type": "json_object"},
    )
    content = response.choices[0].message.content or "{}"
    return json.loads(content)
