import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentOrderTables20260308193000 implements MigrationInterface {
  name = 'AddPaymentOrderTables20260308193000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "pending_upgrade_order" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "plan" character varying(30) NOT NULL,
        "amountInPaise" integer NOT NULL,
        "currency" character varying(10) NOT NULL DEFAULT 'INR',
        "providerOrderId" character varying(120) NOT NULL,
        "paymentId" character varying(120),
        "status" character varying(20) NOT NULL DEFAULT 'created',
        "expiresAt" TIMESTAMP,
        "paidAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_pending_upgrade_order_providerOrderId" UNIQUE ("providerOrderId"),
        CONSTRAINT "UQ_pending_upgrade_order_paymentId" UNIQUE ("paymentId")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_pending_upgrade_order_userId"
      ON "pending_upgrade_order" ("userId");
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "mentor_payment_orders" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "studentId" uuid NOT NULL,
        "mentorId" uuid NOT NULL,
        "durationMinutes" integer NOT NULL,
        "amountInPaise" integer NOT NULL,
        "currency" character varying(10) NOT NULL DEFAULT 'INR',
        "providerOrderId" character varying(120) NOT NULL,
        "paymentId" character varying(120),
        "status" character varying(20) NOT NULL DEFAULT 'created',
        "expiresAt" TIMESTAMP,
        "paidAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_mentor_payment_orders_providerOrderId" UNIQUE ("providerOrderId"),
        CONSTRAINT "UQ_mentor_payment_orders_paymentId" UNIQUE ("paymentId")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_mentor_payment_orders_studentId"
      ON "mentor_payment_orders" ("studentId");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_mentor_payment_orders_mentorId"
      ON "mentor_payment_orders" ("mentorId");
    `);

    await queryRunner.query(`
      ALTER TABLE "mentor_sessions"
      ADD COLUMN IF NOT EXISTS "paymentOrderId" character varying(80);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "mentor_sessions"
      DROP COLUMN IF EXISTS "paymentOrderId";
    `);

    await queryRunner.query('DROP TABLE IF EXISTS "mentor_payment_orders"');
    await queryRunner.query('DROP TABLE IF EXISTS "pending_upgrade_order"');
  }
}
