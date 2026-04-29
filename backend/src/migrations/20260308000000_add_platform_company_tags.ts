import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlatformCompanyTags20260308000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('dsa_problems')) {
      await queryRunner.query(`
              ALTER TABLE "dsa_problems"
              ADD COLUMN IF NOT EXISTS "platform" varchar(20) NOT NULL DEFAULT 'leetcode',
              ADD COLUMN IF NOT EXISTS "externalId" varchar(255),
              ADD COLUMN IF NOT EXISTS "externalUrl" varchar(512),
              ADD COLUMN IF NOT EXISTS "companyTags" text
          `);

      await queryRunner.query(`
              UPDATE "dsa_problems"
              SET "externalId" = "leetcodeSlug"
              WHERE "leetcodeSlug" IS NOT NULL AND "externalId" IS NULL
          `);
    }

    if (await queryRunner.hasTable('sql_problems')) {
      await queryRunner.query(`
              ALTER TABLE "sql_problems"
              ADD COLUMN IF NOT EXISTS "platform" varchar(20) NOT NULL DEFAULT 'leetcode',
              ADD COLUMN IF NOT EXISTS "externalId" varchar(255),
              ADD COLUMN IF NOT EXISTS "externalUrl" varchar(512),
              ADD COLUMN IF NOT EXISTS "companyTags" text
          `);

      await queryRunner.query(`
              UPDATE "sql_problems"
              SET "externalId" = "leetcodeSlug"
              WHERE "leetcodeSlug" IS NOT NULL AND "externalId" IS NULL
          `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('dsa_problems')) {
      await queryRunner.query(`
              ALTER TABLE "dsa_problems"
              DROP COLUMN IF EXISTS "platform",
              DROP COLUMN IF EXISTS "externalId",
              DROP COLUMN IF EXISTS "externalUrl",
              DROP COLUMN IF EXISTS "companyTags"
          `);
    }

    if (await queryRunner.hasTable('sql_problems')) {
      await queryRunner.query(`
              ALTER TABLE "sql_problems"
              DROP COLUMN IF EXISTS "platform",
              DROP COLUMN IF EXISTS "externalId",
              DROP COLUMN IF EXISTS "externalUrl",
              DROP COLUMN IF EXISTS "companyTags"
          `);
    }
  }
}
