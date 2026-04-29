import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlacementJobFields20260427193000
  implements MigrationInterface
{
  name = 'AddPlacementJobFields20260427193000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type
          WHERE typname = 'placement_workMode_enum'
        ) THEN
          CREATE TYPE "placement_workMode_enum" AS ENUM ('Offline', 'Hybrid', 'Remote');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "placement"
      ADD COLUMN IF NOT EXISTS "workMode" "placement_workMode_enum" NOT NULL DEFAULT 'Offline'
    `);

    await queryRunner.query(`
      ALTER TABLE "placement"
      ALTER COLUMN "applyLink" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "placement"
      ADD COLUMN IF NOT EXISTS "jobProfile" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "placement"
      ADD COLUMN IF NOT EXISTS "packageOffered" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "placement"
      ADD COLUMN IF NOT EXISTS "roles" text[] NOT NULL DEFAULT '{}'
    `);

    await queryRunner.query(`
      ALTER TABLE "placement"
      ADD COLUMN IF NOT EXISTS "skillsRequired" text[] NOT NULL DEFAULT '{}'
    `);

    await queryRunner.query(`
      ALTER TABLE "placement"
      ADD COLUMN IF NOT EXISTS "experienceRequired" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "placement"
      ADD COLUMN IF NOT EXISTS "openings" integer
    `);

    await queryRunner.query(`
      ALTER TABLE "placement"
      ADD COLUMN IF NOT EXISTS "applicationDeadline" TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "placement"
      DROP COLUMN IF EXISTS "applicationDeadline"
    `);

    await queryRunner.query(`
      ALTER TABLE "placement"
      DROP COLUMN IF EXISTS "openings"
    `);

    await queryRunner.query(`
      ALTER TABLE "placement"
      DROP COLUMN IF EXISTS "experienceRequired"
    `);

    await queryRunner.query(`
      ALTER TABLE "placement"
      DROP COLUMN IF EXISTS "skillsRequired"
    `);

    await queryRunner.query(`
      ALTER TABLE "placement"
      DROP COLUMN IF EXISTS "roles"
    `);

    await queryRunner.query(`
      ALTER TABLE "placement"
      DROP COLUMN IF EXISTS "packageOffered"
    `);

    await queryRunner.query(`
      ALTER TABLE "placement"
      DROP COLUMN IF EXISTS "jobProfile"
    `);

    await queryRunner.query(`
      ALTER TABLE "placement"
      DROP COLUMN IF EXISTS "workMode"
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_type
          WHERE typname = 'placement_workMode_enum'
        ) THEN
          DROP TYPE "placement_workMode_enum";
        END IF;
      END
      $$;
    `);
  }
}
