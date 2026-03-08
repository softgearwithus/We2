import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillMockTestColumns20260308143000 implements MigrationInterface {
  name = 'BackfillMockTestColumns20260308143000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "mock_tests"
      ADD COLUMN IF NOT EXISTS "isPublished" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "mock_test_questions"
      ADD COLUMN IF NOT EXISTS "solutionText" text,
      ADD COLUMN IF NOT EXISTS "passageContent" text,
      ADD COLUMN IF NOT EXISTS "imageUrl" text
    `);

    await queryRunner.query(`
      ALTER TYPE "public"."mock_test_questions_questiontype_enum"
      ADD VALUE IF NOT EXISTS 'SINGLE_CORRECT'
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."mock_test_questions_questiontype_enum"
      ADD VALUE IF NOT EXISTS 'MULTI_CORRECT'
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."mock_test_questions_questiontype_enum"
      ADD VALUE IF NOT EXISTS 'CODE'
    `);

    await queryRunner.query(`
      UPDATE "mock_test_questions"
      SET "questionType" = 'SINGLE_CORRECT'
      WHERE "questionType"::text = 'MCQ'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "mock_test_questions"
      DROP COLUMN IF EXISTS "imageUrl",
      DROP COLUMN IF EXISTS "passageContent"
    `);
  }
}
