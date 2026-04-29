import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApplicationCandidateFields20260429113000
  implements MigrationInterface
{
  name = 'AddApplicationCandidateFields20260429113000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "candidateName" character varying(120)
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "candidateEmail" character varying(255)
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "candidatePhone" character varying(20)
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "candidateDepartment" character varying(120)
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "candidateYear" character varying(40)
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "candidateLocation" character varying(120)
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "candidateLinkedinUrl" character varying(255)
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "resumeDriveUrl" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "application"
      DROP COLUMN IF EXISTS "resumeDriveUrl"
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      DROP COLUMN IF EXISTS "candidateLinkedinUrl"
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      DROP COLUMN IF EXISTS "candidateLocation"
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      DROP COLUMN IF EXISTS "candidateYear"
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      DROP COLUMN IF EXISTS "candidateDepartment"
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      DROP COLUMN IF EXISTS "candidatePhone"
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      DROP COLUMN IF EXISTS "candidateEmail"
    `);

    await queryRunner.query(`
      ALTER TABLE "application"
      DROP COLUMN IF EXISTS "candidateName"
    `);
  }
}
