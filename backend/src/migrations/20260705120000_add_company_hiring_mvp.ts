import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyHiringMvp20260705120000
  implements MigrationInterface
{
  name = 'AddCompanyHiringMvp20260705120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hiring_assessments_status_enum') THEN
          CREATE TYPE "hiring_assessments_status_enum" AS ENUM ('draft', 'published', 'archived');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "hiring_assessments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "placementId" uuid NOT NULL,
        "companyId" uuid,
        "name" character varying(160) NOT NULL,
        "language" character varying(40),
        "timeLimitMinutes" integer,
        "instructions" text,
        "files" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "status" "hiring_assessments_status_enum" NOT NULL DEFAULT 'draft',
        "version" integer NOT NULL DEFAULT 1,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_hiring_assessments_placementId"
      ON "hiring_assessments" ("placementId");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_hiring_assessments_companyId"
      ON "hiring_assessments" ("companyId");
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_hiring_assessments_placement'
        ) THEN
          ALTER TABLE "hiring_assessments"
          ADD CONSTRAINT "FK_hiring_assessments_placement"
          FOREIGN KEY ("placementId") REFERENCES "placement"("id") ON DELETE CASCADE;
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_pipelineStage_enum') THEN
          CREATE TYPE "application_pipelineStage_enum" AS ENUM (
            'invited',
            'in_progress',
            'pending_review',
            'advanced',
            'rejected',
            'expired'
          );
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_reviewDecision_enum') THEN
          CREATE TYPE "application_reviewDecision_enum" AS ENUM ('pending', 'advance', 'reject');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_source_enum') THEN
          CREATE TYPE "application_source_enum" AS ENUM ('applied', 'invited');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ALTER COLUMN "studentId" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "assessmentId" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "pipelineStage" "application_pipelineStage_enum" NOT NULL DEFAULT 'pending_review'
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "reviewDecision" "application_reviewDecision_enum" NOT NULL DEFAULT 'pending'
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "source" "application_source_enum" NOT NULL DEFAULT 'applied'
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "score" double precision
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "reviewNotes" text
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "submissionSummary" text
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "submissionArtifacts" jsonb
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "inviteToken" character varying(120)
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "inviteUrl" text
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "invitedAt" TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "acceptedAt" TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP
    `);

    await queryRunner.query(`
      UPDATE "application"
      SET "submittedAt" = COALESCE("submittedAt", "appliedAt")
      WHERE "source" = 'applied';
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_application_placementId"
      ON "application" ("placementId");
    `);

    await queryRunner.query(`
      ALTER TABLE "placement"
      ADD COLUMN IF NOT EXISTS "githubRepositoryUrl" character varying,
      ADD COLUMN IF NOT EXISTS "issueTrackerUrl" character varying,
      ADD COLUMN IF NOT EXISTS "documentationUrl" character varying,
      ADD COLUMN IF NOT EXISTS "workContext" text,
      ADD COLUMN IF NOT EXISTS "pipelineNotes" text
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_application_assessmentId"
      ON "application" ("assessmentId");
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_application_inviteToken_unique"
      ON "application" ("inviteToken")
      WHERE "inviteToken" IS NOT NULL;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_application_assessment'
        ) THEN
          ALTER TABLE "application"
          ADD CONSTRAINT "FK_application_assessment"
          FOREIGN KEY ("assessmentId") REFERENCES "hiring_assessments"("id") ON DELETE SET NULL;
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "application"
      DROP CONSTRAINT IF EXISTS "FK_application_assessment"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_application_inviteToken_unique"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_application_assessmentId"
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      DROP COLUMN IF EXISTS "expiresAt",
      DROP COLUMN IF EXISTS "submittedAt",
      DROP COLUMN IF EXISTS "startedAt",
      DROP COLUMN IF EXISTS "acceptedAt",
      DROP COLUMN IF EXISTS "invitedAt",
      DROP COLUMN IF EXISTS "inviteUrl",
      DROP COLUMN IF EXISTS "inviteToken",
      DROP COLUMN IF EXISTS "submissionArtifacts",
      DROP COLUMN IF EXISTS "submissionSummary",
      DROP COLUMN IF EXISTS "reviewNotes",
      DROP COLUMN IF EXISTS "score",
      DROP COLUMN IF EXISTS "source",
      DROP COLUMN IF EXISTS "reviewDecision",
      DROP COLUMN IF EXISTS "pipelineStage",
      DROP COLUMN IF EXISTS "assessmentId"
    `);

    await queryRunner.query(`
      ALTER TABLE "placement"
      DROP COLUMN IF EXISTS "pipelineNotes",
      DROP COLUMN IF EXISTS "workContext",
      DROP COLUMN IF EXISTS "documentationUrl",
      DROP COLUMN IF EXISTS "issueTrackerUrl",
      DROP COLUMN IF EXISTS "githubRepositoryUrl"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "hiring_assessments"
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS "application_source_enum"
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS "application_reviewDecision_enum"
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS "application_pipelineStage_enum"
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS "hiring_assessments_status_enum"
    `);
  }
}
