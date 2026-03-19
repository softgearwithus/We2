import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixProdSchemaForTestSeriesResume20260320100000 implements MigrationInterface {
  name = 'FixProdSchemaForTestSeriesResume20260320100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "companies"
      ADD COLUMN IF NOT EXISTS "isNew" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "mock_tests"
      ADD COLUMN IF NOT EXISTS "isNew" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "mock_test_results"
      ADD COLUMN IF NOT EXISTS "total_questions" integer NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      ALTER TABLE "mcq_question"
      ADD COLUMN IF NOT EXISTS "isNew" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_6543e24d4d8714017acd1a1b39"
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_resume_userId"
      ON "resume" ("userId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_resume_userId"
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_6543e24d4d8714017acd1a1b39"
      ON "resume" ("userId")
    `);

    await queryRunner.query(`
      ALTER TABLE "mock_test_results"
      DROP COLUMN IF EXISTS "total_questions"
    `);

    await queryRunner.query(`
      ALTER TABLE "mcq_question"
      DROP COLUMN IF EXISTS "isNew"
    `);

    await queryRunner.query(`
      ALTER TABLE "mock_tests"
      DROP COLUMN IF EXISTS "isNew"
    `);

    await queryRunner.query(`
      ALTER TABLE "companies"
      DROP COLUMN IF EXISTS "isNew"
    `);
  }
}
