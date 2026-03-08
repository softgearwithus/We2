import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSingleSessionFieldsToUser20260308170000 implements MigrationInterface {
  name = 'AddSingleSessionFieldsToUser20260308170000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "sessionVersion" integer NOT NULL DEFAULT 0'
    );
    await queryRunner.query(
      'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP'
    );
    await queryRunner.query(
      'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "lastLoginIp" character varying(64)'
    );
    await queryRunner.query(
      'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "lastLoginUserAgent" character varying(512)'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN IF EXISTS "lastLoginUserAgent"');
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN IF EXISTS "lastLoginIp"');
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN IF EXISTS "lastLoginAt"');
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN IF EXISTS "sessionVersion"');
  }
}
