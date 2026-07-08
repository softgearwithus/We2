import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStandaloneAssessmentsAndGithubIntegrations20260705143000
  implements MigrationInterface
{
  name = 'AddStandaloneAssessmentsAndGithubIntegrations20260705143000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "hiring_assessments"
      ADD COLUMN IF NOT EXISTS "contextSources" jsonb NOT NULL DEFAULT '[]'::jsonb
    `);

    await queryRunner.query(`
      UPDATE "hiring_assessments" assessment
      SET "companyId" = placement."companyId"
      FROM "placement" placement
      WHERE assessment."placementId" = placement."id"
      AND assessment."companyId" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "hiring_assessments"
      ALTER COLUMN "placementId" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "hiring_assessments"
      DROP CONSTRAINT IF EXISTS "FK_hiring_assessments_placement"
    `);

    await queryRunner.query(`
      ALTER TABLE "hiring_assessments"
      ADD CONSTRAINT "FK_hiring_assessments_placement"
      FOREIGN KEY ("placementId") REFERENCES "placement"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "hiring_assessment_placements" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "companyId" uuid NOT NULL,
        "assessmentId" uuid NOT NULL,
        "placementId" uuid NOT NULL,
        "stageName" character varying(120),
        "isPrimary" boolean NOT NULL DEFAULT false,
        "contextSnapshot" jsonb,
        "attachedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_hiring_assessment_links_assessment"
          FOREIGN KEY ("assessmentId") REFERENCES "hiring_assessments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_hiring_assessment_links_placement"
          FOREIGN KEY ("placementId") REFERENCES "placement"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_hiring_assessment_links_unique"
      ON "hiring_assessment_placements" ("assessmentId", "placementId")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_hiring_assessment_links_company"
      ON "hiring_assessment_placements" ("companyId")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_hiring_assessment_links_assessment"
      ON "hiring_assessment_placements" ("assessmentId")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_hiring_assessment_links_placement"
      ON "hiring_assessment_placements" ("placementId")
    `);

    await queryRunner.query(`
      INSERT INTO "hiring_assessment_placements"
        ("companyId", "assessmentId", "placementId", "stageName", "isPrimary", "contextSnapshot", "attachedAt", "updatedAt")
      SELECT
        COALESCE(assessment."companyId", placement."companyId"),
        assessment."id",
        assessment."placementId",
        assessment."stageName",
        assessment."id" = latest."assessmentId",
        assessment."contextSnapshot",
        assessment."createdAt",
        assessment."updatedAt"
      FROM "hiring_assessments" assessment
      JOIN "placement" placement ON placement."id" = assessment."placementId"
      JOIN (
        SELECT DISTINCT ON ("placementId") "placementId", "id" AS "assessmentId"
        FROM "hiring_assessments"
        WHERE "placementId" IS NOT NULL
        ORDER BY "placementId", "createdAt" DESC
      ) latest ON latest."placementId" = assessment."placementId"
      WHERE assessment."placementId" IS NOT NULL
      ON CONFLICT ("assessmentId", "placementId") DO NOTHING
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "github_installations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "companyId" uuid NOT NULL,
        "installationId" character varying(80) NOT NULL,
        "accountLogin" character varying(160),
        "accountType" character varying(40),
        "accountId" character varying(80),
        "repositorySelection" character varying(40),
        "permissions" jsonb,
        "installedAt" TIMESTAMP,
        "lastSyncedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_github_installations_company_installation"
      ON "github_installations" ("companyId", "installationId")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_github_installations_company"
      ON "github_installations" ("companyId")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_github_installations_installation"
      ON "github_installations" ("installationId")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "github_repositories" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "companyId" uuid NOT NULL,
        "installationRecordId" uuid NOT NULL,
        "installationId" character varying(80) NOT NULL,
        "githubRepositoryId" character varying(80) NOT NULL,
        "fullName" character varying(255) NOT NULL,
        "owner" character varying(140) NOT NULL,
        "name" character varying(140) NOT NULL,
        "htmlUrl" text NOT NULL,
        "defaultBranch" character varying(120),
        "selectedBranch" character varying(120),
        "private" boolean NOT NULL DEFAULT false,
        "isLinked" boolean NOT NULL DEFAULT false,
        "permissions" jsonb,
        "linkedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_github_repositories_company_repo"
      ON "github_repositories" ("companyId", "githubRepositoryId")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_github_repositories_company"
      ON "github_repositories" ("companyId")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_github_repositories_installation_record"
      ON "github_repositories" ("installationRecordId")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_github_repositories_installation"
      ON "github_repositories" ("installationId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_github_repositories_installation"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_github_repositories_installation_record"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_github_repositories_company"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_github_repositories_company_repo"');
    await queryRunner.query('DROP TABLE IF EXISTS "github_repositories"');

    await queryRunner.query('DROP INDEX IF EXISTS "idx_github_installations_installation"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_github_installations_company"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_github_installations_company_installation"');
    await queryRunner.query('DROP TABLE IF EXISTS "github_installations"');

    await queryRunner.query('DROP INDEX IF EXISTS "idx_hiring_assessment_links_placement"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_hiring_assessment_links_assessment"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_hiring_assessment_links_company"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_hiring_assessment_links_unique"');
    await queryRunner.query('DROP TABLE IF EXISTS "hiring_assessment_placements"');

    await queryRunner.query(`
      ALTER TABLE "hiring_assessments"
      DROP CONSTRAINT IF EXISTS "FK_hiring_assessments_placement"
    `);
    await queryRunner.query(`
      ALTER TABLE "hiring_assessments"
      ADD CONSTRAINT "FK_hiring_assessments_placement"
      FOREIGN KEY ("placementId") REFERENCES "placement"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "hiring_assessments"
      DROP COLUMN IF EXISTS "contextSources"
    `);
  }
}
