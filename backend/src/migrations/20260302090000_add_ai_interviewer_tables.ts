import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAiInterviewerTables20260302090000 implements MigrationInterface {
  name = 'AddAiInterviewerTables20260302090000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "resume_documents" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "userId" uuid NOT NULL,
                "blobUrl" text,
                "fileName" character varying(255),
                "fileType" character varying(20),
                "parseStatus" character varying(20) NOT NULL DEFAULT 'pending',
                "extractedText" text,
                "parsedJson" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            );
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "ai_interview_sessions" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "interviewSessionId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                "resumeId" uuid,
                "status" character varying(30) NOT NULL DEFAULT 'scheduled',
                "startedAt" TIMESTAMP,
                "endedAt" TIMESTAMP,
                "timerSeconds" integer NOT NULL DEFAULT 900,
                "warningsCount" integer NOT NULL DEFAULT 0,
                "terminationReason" character varying(255),
                "coverageMap" jsonb,
                "providerVersion" character varying(50),
                "externalSessionId" character varying(80),
                "candidateJoinUrl" character varying(512),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            );
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_ai_interview_sessions_interviewSessionId" ON "ai_interview_sessions" ("interviewSessionId");
        `);
    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_ai_interview_sessions_userId" ON "ai_interview_sessions" ("userId");
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "ai_interview_reports" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "sessionId" uuid NOT NULL,
                "overallScore" integer,
                "dimensionScores" jsonb,
                "strengths" jsonb,
                "weaknesses" jsonb,
                "recommendations" jsonb,
                "summary" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now()
            );
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_ai_interview_reports_sessionId" ON "ai_interview_reports" ("sessionId");
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "ai_interview_moderation_events" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "sessionId" uuid NOT NULL,
                "warningLevel" integer NOT NULL DEFAULT 1,
                "reason" text NOT NULL,
                "evidenceRefs" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now()
            );
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_ai_interview_moderation_events_sessionId" ON "ai_interview_moderation_events" ("sessionId");
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TABLE IF EXISTS "ai_interview_moderation_events"',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "ai_interview_reports"');
    await queryRunner.query('DROP TABLE IF EXISTS "ai_interview_sessions"');
    await queryRunner.query('DROP TABLE IF EXISTS "resume_documents"');
  }
}
