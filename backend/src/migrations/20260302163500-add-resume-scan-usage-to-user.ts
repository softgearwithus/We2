import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResumeScanUsageToUser20260302163500 implements MigrationInterface {
  name = 'AddResumeScanUsageToUser20260302163500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "resumeScanUsage" integer NOT NULL DEFAULT 0',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "user" DROP COLUMN IF EXISTS "resumeScanUsage"',
    );
  }
}
