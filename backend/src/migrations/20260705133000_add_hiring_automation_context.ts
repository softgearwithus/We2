import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHiringAutomationContext20260705133000
  implements MigrationInterface
{
  name = 'AddHiringAutomationContext20260705133000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "placement"
      ADD COLUMN IF NOT EXISTS "pipelineTemplateKey" character varying,
      ADD COLUMN IF NOT EXISTS "pipelineStages" jsonb,
      ADD COLUMN IF NOT EXISTS "automationEnabled" boolean NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS "companyProfileIncluded" boolean NOT NULL DEFAULT true
    `);

    await queryRunner.query(`
      ALTER TABLE "hiring_assessments"
      ADD COLUMN IF NOT EXISTS "stageName" character varying(120),
      ADD COLUMN IF NOT EXISTS "prompt" text,
      ADD COLUMN IF NOT EXISTS "contextSnapshot" jsonb
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "aiInterviewSessionId" character varying(120),
      ADD COLUMN IF NOT EXISTS "candidateJoinUrl" text,
      ADD COLUMN IF NOT EXISTS "interviewLaunchStatus" character varying(40),
      ADD COLUMN IF NOT EXISTS "interviewLaunchError" text,
      ADD COLUMN IF NOT EXISTS "interviewEmailStatus" character varying(40),
      ADD COLUMN IF NOT EXISTS "interviewEmailError" text,
      ADD COLUMN IF NOT EXISTS "interviewEmailSentAt" TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "application"
      DROP COLUMN IF EXISTS "interviewEmailSentAt",
      DROP COLUMN IF EXISTS "interviewEmailError",
      DROP COLUMN IF EXISTS "interviewEmailStatus",
      DROP COLUMN IF EXISTS "interviewLaunchError",
      DROP COLUMN IF EXISTS "interviewLaunchStatus",
      DROP COLUMN IF EXISTS "candidateJoinUrl",
      DROP COLUMN IF EXISTS "aiInterviewSessionId"
    `);

    await queryRunner.query(`
      ALTER TABLE "hiring_assessments"
      DROP COLUMN IF EXISTS "contextSnapshot",
      DROP COLUMN IF EXISTS "prompt",
      DROP COLUMN IF EXISTS "stageName"
    `);

    await queryRunner.query(`
      ALTER TABLE "placement"
      DROP COLUMN IF EXISTS "companyProfileIncluded",
      DROP COLUMN IF EXISTS "automationEnabled",
      DROP COLUMN IF EXISTS "pipelineStages",
      DROP COLUMN IF EXISTS "pipelineTemplateKey"
    `);
  }
}
