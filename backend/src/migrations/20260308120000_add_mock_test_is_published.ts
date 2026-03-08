import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMockTestIsPublished20260308120000 implements MigrationInterface {
  name = 'AddMockTestIsPublished20260308120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "mock_tests"
      ADD COLUMN IF NOT EXISTS "isPublished" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "mock_tests"
      DROP COLUMN IF EXISTS "isPublished"
    `);
  }
}
