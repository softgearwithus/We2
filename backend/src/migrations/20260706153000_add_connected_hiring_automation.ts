import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConnectedHiringAutomation20260706153000
  implements MigrationInterface
{
  name = 'AddConnectedHiringAutomation20260706153000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "placement"
      ADD COLUMN IF NOT EXISTS "shortlistScoreThreshold" integer NOT NULL DEFAULT 75
    `);
    await queryRunner.query(`
      ALTER TABLE "placement"
      ADD COLUMN IF NOT EXISTS "interviewDurationMinutes" integer NOT NULL DEFAULT 45
    `);
    await queryRunner.query(`
      ALTER TABLE "placement"
      ADD COLUMN IF NOT EXISTS "interviewWindowStart" TIMESTAMP
    `);
    await queryRunner.query(`
      ALTER TABLE "placement"
      ADD COLUMN IF NOT EXISTS "interviewWindowEnd" TIMESTAMP
    `);
    await queryRunner.query(`
      ALTER TABLE "placement"
      ADD COLUMN IF NOT EXISTS "autoInviteShortlisted" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE "placement"
      ADD COLUMN IF NOT EXISTS "automationMode" character varying(40) NOT NULL DEFAULT 'manual_screening'
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "screeningStatus" character varying(40) NOT NULL DEFAULT 'not_screened'
    `);
    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "screeningSummary" text
    `);
    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "screeningMatchedSkills" text array NOT NULL DEFAULT '{}'
    `);
    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "screeningMissingSkills" text array NOT NULL DEFAULT '{}'
    `);
    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "screeningDetails" jsonb
    `);
    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "screenedAt" TIMESTAMP
    `);
    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "studentFacingStatus" character varying(40) NOT NULL DEFAULT 'applied'
    `);
    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "interviewRetriedAt" TIMESTAMP
    `);
    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "interviewRetryCount" integer NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "application" DROP COLUMN IF EXISTS "interviewRetryCount"
    `);
    await queryRunner.query(`
      ALTER TABLE "application" DROP COLUMN IF EXISTS "interviewRetriedAt"
    `);
    await queryRunner.query(`
      ALTER TABLE "application" DROP COLUMN IF EXISTS "studentFacingStatus"
    `);
    await queryRunner.query(`
      ALTER TABLE "application" DROP COLUMN IF EXISTS "screenedAt"
    `);
    await queryRunner.query(`
      ALTER TABLE "application" DROP COLUMN IF EXISTS "screeningDetails"
    `);
    await queryRunner.query(`
      ALTER TABLE "application" DROP COLUMN IF EXISTS "screeningMissingSkills"
    `);
    await queryRunner.query(`
      ALTER TABLE "application" DROP COLUMN IF EXISTS "screeningMatchedSkills"
    `);
    await queryRunner.query(`
      ALTER TABLE "application" DROP COLUMN IF EXISTS "screeningSummary"
    `);
    await queryRunner.query(`
      ALTER TABLE "application" DROP COLUMN IF EXISTS "screeningStatus"
    `);

    await queryRunner.query(`
      ALTER TABLE "placement" DROP COLUMN IF EXISTS "automationMode"
    `);
    await queryRunner.query(`
      ALTER TABLE "placement" DROP COLUMN IF EXISTS "autoInviteShortlisted"
    `);
    await queryRunner.query(`
      ALTER TABLE "placement" DROP COLUMN IF EXISTS "interviewWindowEnd"
    `);
    await queryRunner.query(`
      ALTER TABLE "placement" DROP COLUMN IF EXISTS "interviewWindowStart"
    `);
    await queryRunner.query(`
      ALTER TABLE "placement" DROP COLUMN IF EXISTS "interviewDurationMinutes"
    `);
    await queryRunner.query(`
      ALTER TABLE "placement" DROP COLUMN IF EXISTS "shortlistScoreThreshold"
    `);
  }
}
