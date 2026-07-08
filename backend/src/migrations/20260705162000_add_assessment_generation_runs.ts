import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAssessmentGenerationRuns20260705162000
  implements MigrationInterface
{
  name = 'AddAssessmentGenerationRuns20260705162000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "assessment_generation_runs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "companyId" uuid NOT NULL,
        "roleId" uuid,
        "assessmentId" uuid,
        "status" character varying(32) NOT NULL DEFAULT 'generating',
        "prompt" text NOT NULL,
        "mode" character varying(32),
        "generationMode" character varying(24),
        "repositoryIds" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "contextSources" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "provider" character varying(60),
        "model" character varying(120),
        "error" text,
        "inputSnapshot" jsonb,
        "outputSnapshot" jsonb,
        "validationResult" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_assessment_generation_runs_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_assessment_generation_runs_companyId"
      ON "assessment_generation_runs" ("companyId")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_assessment_generation_runs_roleId"
      ON "assessment_generation_runs" ("roleId")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_assessment_generation_runs_assessmentId"
      ON "assessment_generation_runs" ("assessmentId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "IDX_assessment_generation_runs_assessmentId"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "IDX_assessment_generation_runs_roleId"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "IDX_assessment_generation_runs_companyId"',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "assessment_generation_runs"');
  }
}
