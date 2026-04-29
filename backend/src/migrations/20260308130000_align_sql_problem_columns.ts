import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignSqlProblemColumns20260308130000 implements MigrationInterface {
  name = 'AlignSqlProblemColumns20260308130000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('sql_problems'))) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE "sql_problems"
      ADD COLUMN IF NOT EXISTS "platform" character varying(255)
    `);
    await queryRunner.query(`
      ALTER TABLE "sql_problems"
      ADD COLUMN IF NOT EXISTS "externalId" character varying(255)
    `);
    await queryRunner.query(`
      ALTER TABLE "sql_problems"
      ADD COLUMN IF NOT EXISTS "externalUrl" character varying(512)
    `);
    await queryRunner.query(`
      ALTER TABLE "sql_problems"
      ADD COLUMN IF NOT EXISTS "companyTags" jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('sql_problems'))) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE "sql_problems"
      DROP COLUMN IF EXISTS "companyTags"
    `);
    await queryRunner.query(`
      ALTER TABLE "sql_problems"
      DROP COLUMN IF EXISTS "externalUrl"
    `);
    await queryRunner.query(`
      ALTER TABLE "sql_problems"
      DROP COLUMN IF EXISTS "externalId"
    `);
    await queryRunner.query(`
      ALTER TABLE "sql_problems"
      DROP COLUMN IF EXISTS "platform"
    `);
  }
}
