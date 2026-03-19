import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMcqIsNewColumn20260320103000 implements MigrationInterface {
  name = 'AddMcqIsNewColumn20260320103000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "mcq_question"
      ADD COLUMN IF NOT EXISTS "isNew" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "mcq_question"
      DROP COLUMN IF EXISTS "isNew"
    `);
  }
}
