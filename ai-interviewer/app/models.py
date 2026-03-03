from sqlalchemy import Column, String, DateTime, Integer, JSON, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from .db import Base


class ResumeDocument(Base):
    __tablename__ = "resume_documents"

    id = Column(UUID(as_uuid=False), primary_key=True)
    user_id = Column("userId", UUID(as_uuid=False), index=True, nullable=False)
    blob_url = Column("blobUrl", Text, nullable=True)
    file_name = Column("fileName", String(255), nullable=True)
    file_type = Column("fileType", String(20), nullable=True)
    parse_status = Column("parseStatus", String(20), nullable=False, default="pending")
    parsed_json = Column("parsedJson", JSON, nullable=True)
    created_at = Column("createdAt", DateTime(timezone=False), server_default=func.now())
    updated_at = Column("updatedAt", DateTime(timezone=False), server_default=func.now(), onupdate=func.now())


class AiInterviewSession(Base):
    __tablename__ = "ai_interview_sessions"

    id = Column(UUID(as_uuid=False), primary_key=True)
    interview_session_id = Column("interviewSessionId", UUID(as_uuid=False), index=True, nullable=False)
    user_id = Column("userId", UUID(as_uuid=False), index=True, nullable=False)
    resume_id = Column("resumeId", UUID(as_uuid=False), ForeignKey("resume_documents.id"), nullable=True)
    status = Column(String(30), nullable=False, default="scheduled")
    started_at = Column("startedAt", DateTime(timezone=False), nullable=True)
    ended_at = Column("endedAt", DateTime(timezone=False), nullable=True)
    timer_seconds = Column("timerSeconds", Integer, nullable=False, default=900)
    warnings_count = Column("warningsCount", Integer, nullable=False, default=0)
    termination_reason = Column("terminationReason", String(255), nullable=True)
    coverage_map = Column("coverageMap", JSON, nullable=True)
    provider_version = Column("providerVersion", String(50), nullable=True)
    external_session_id = Column("externalSessionId", String(80), nullable=True)
    created_at = Column("createdAt", DateTime(timezone=False), server_default=func.now())
    updated_at = Column("updatedAt", DateTime(timezone=False), server_default=func.now(), onupdate=func.now())


class AiInterviewTurn(Base):
    __tablename__ = "ai_interview_turns"

    id = Column(UUID(as_uuid=False), primary_key=True)
    session_id = Column(UUID(as_uuid=False), ForeignKey("ai_interview_sessions.id"), index=True, nullable=False)
    turn_index = Column(Integer, nullable=False, default=0)
    role = Column(String(20), nullable=False)
    prompt = Column(Text, nullable=True)
    transcript = Column(Text, nullable=True)
    evidence_refs = Column(JSON, nullable=True)
    scores_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AiInterviewReport(Base):
    __tablename__ = "ai_interview_reports"

    id = Column(UUID(as_uuid=False), primary_key=True)
    session_id = Column("sessionId", UUID(as_uuid=False), ForeignKey("ai_interview_sessions.id"), index=True, nullable=False)
    overall_score = Column("overallScore", Integer, nullable=True)
    dimension_scores = Column("dimensionScores", JSON, nullable=True)
    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column("createdAt", DateTime(timezone=False), server_default=func.now())


class AiInterviewModerationEvent(Base):
    __tablename__ = "ai_interview_moderation_events"

    id = Column(UUID(as_uuid=False), primary_key=True)
    session_id = Column("sessionId", UUID(as_uuid=False), ForeignKey("ai_interview_sessions.id"), index=True, nullable=False)
    warning_level = Column("warningLevel", Integer, nullable=False, default=1)
    reason = Column(Text, nullable=False)
    evidence_refs = Column("evidenceRefs", JSON, nullable=True)
    created_at = Column("createdAt", DateTime(timezone=False), server_default=func.now())
