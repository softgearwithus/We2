import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyInviteEmailDelivery20260706170000
  implements MigrationInterface
{
  name = 'AddCompanyInviteEmailDelivery20260706170000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "company_invites"
      ADD COLUMN IF NOT EXISTS "emailDeliveryStatus" character varying(30) NOT NULL DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS "emailDeliveryError" text,
      ADD COLUMN IF NOT EXISTS "emailSentAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "emailLastAttemptAt" TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "company_invites"
      DROP COLUMN IF EXISTS "emailLastAttemptAt",
      DROP COLUMN IF EXISTS "emailSentAt",
      DROP COLUMN IF EXISTS "emailDeliveryError",
      DROP COLUMN IF EXISTS "emailDeliveryStatus"
    `);
  }
}
