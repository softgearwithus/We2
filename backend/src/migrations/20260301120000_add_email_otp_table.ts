import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailOtpTable20260301120000 implements MigrationInterface {
    name = 'AddEmailOtpTable20260301120000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "email_otp" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "email" varchar(255) NOT NULL,
                "otpHash" varchar(255) NOT NULL,
                "expiresAt" timestamp NOT NULL,
                "attempts" integer NOT NULL DEFAULT 0,
                "lastSentAt" timestamp NULL,
                "verifiedAt" timestamp NULL,
                "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_email_otp_email" ON "email_otp" ("email");`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "email_otp";`);
    }
}
