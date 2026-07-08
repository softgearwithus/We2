import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGithubRepositoryContextSnapshot20260705153000
  implements MigrationInterface
{
  name = 'AddGithubRepositoryContextSnapshot20260705153000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "github_repositories"
      ADD COLUMN IF NOT EXISTS "contextStatus" character varying(24)
    `);
    await queryRunner.query(`
      ALTER TABLE "github_repositories"
      ADD COLUMN IF NOT EXISTS "contextSnapshot" jsonb
    `);
    await queryRunner.query(`
      ALTER TABLE "github_repositories"
      ADD COLUMN IF NOT EXISTS "contextSyncedAt" TIMESTAMP
    `);
    await queryRunner.query(`
      ALTER TABLE "github_repositories"
      ADD COLUMN IF NOT EXISTS "contextError" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "github_repositories"
      DROP COLUMN IF EXISTS "contextError"
    `);
    await queryRunner.query(`
      ALTER TABLE "github_repositories"
      DROP COLUMN IF EXISTS "contextSyncedAt"
    `);
    await queryRunner.query(`
      ALTER TABLE "github_repositories"
      DROP COLUMN IF EXISTS "contextSnapshot"
    `);
    await queryRunner.query(`
      ALTER TABLE "github_repositories"
      DROP COLUMN IF EXISTS "contextStatus"
    `);
  }
}
