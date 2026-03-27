import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailOtpPurposeAndConsumed20260316110000 implements MigrationInterface {
  name = 'AddEmailOtpPurposeAndConsumed20260316110000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "email_otp"
            ADD COLUMN IF NOT EXISTS "purpose" varchar(32) NOT NULL DEFAULT 'register';
        `);

    await queryRunner.query(`
            ALTER TABLE "email_otp"
            ADD COLUMN IF NOT EXISTS "consumedAt" timestamp NULL;
        `);

    await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "IDX_email_otp_email_purpose_unique"
            ON "email_otp" ("email", "purpose");
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_email_otp_email_purpose_unique";`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_otp" DROP COLUMN IF EXISTS "consumedAt";`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_otp" DROP COLUMN IF EXISTS "purpose";`,
    );
  }
}
