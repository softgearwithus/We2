import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMockTestQuestionAssets20260308133000 implements MigrationInterface {
  name = 'AddMockTestQuestionAssets20260308133000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "mock_test_questions"
      ADD COLUMN IF NOT EXISTS "imageUrl" text
    `);
    await queryRunner.query(`
      ALTER TABLE "mock_test_questions"
      ADD COLUMN IF NOT EXISTS "passageContent" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "mock_test_questions"
      DROP COLUMN IF EXISTS "passageContent"
    `);
    await queryRunner.query(`
      ALTER TABLE "mock_test_questions"
      DROP COLUMN IF EXISTS "imageUrl"
    `);
  }
}
