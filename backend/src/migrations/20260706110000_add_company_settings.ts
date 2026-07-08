import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanySettings20260706110000 implements MigrationInterface {
  name = 'AddCompanySettings20260706110000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "company_profiles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "companyId" uuid NOT NULL,
        "displayName" character varying(160) NOT NULL,
        "legalName" character varying(180),
        "slug" character varying(140) NOT NULL,
        "website" character varying(255),
        "supportEmail" character varying(255),
        "verificationEmail" character varying(255),
        "logoUrl" character varying(512),
        "description" text,
        "industry" character varying(120),
        "productType" character varying(120),
        "domain" character varying(160),
        "companyContext" text,
        "hiringDefaults" jsonb,
        "subscriptionPlan" character varying(40) NOT NULL DEFAULT 'free',
        "subscriptionStatus" character varying(40) NOT NULL DEFAULT 'inactive',
        "subscriptionEndDate" TIMESTAMP,
        "billingStartedAt" TIMESTAMP,
        "usageSnapshot" jsonb,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_company_profiles_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_company_profiles_companyId" UNIQUE ("companyId"),
        CONSTRAINT "UQ_company_profiles_slug" UNIQUE ("slug")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_company_profiles_companyId" ON "company_profiles" ("companyId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_company_profiles_slug" ON "company_profiles" ("slug")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "company_members" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "companyId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "role" character varying(30) NOT NULL DEFAULT 'member',
        "isActive" boolean NOT NULL DEFAULT true,
        "leftAt" TIMESTAMP,
        "joinedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_company_members_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_company_members_company_user" UNIQUE ("companyId", "userId")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_company_members_companyId" ON "company_members" ("companyId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_company_members_userId" ON "company_members" ("userId")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "company_invites" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "companyId" uuid NOT NULL,
        "email" character varying(255) NOT NULL,
        "role" character varying(30) NOT NULL DEFAULT 'member',
        "tokenHash" character varying(128) NOT NULL,
        "status" character varying(30) NOT NULL DEFAULT 'pending',
        "invitedByUserId" uuid,
        "acceptedByUserId" uuid,
        "expiresAt" TIMESTAMP NOT NULL,
        "acceptedAt" TIMESTAMP,
        "revokedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_company_invites_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_company_invites_tokenHash" UNIQUE ("tokenHash")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_company_invites_companyId" ON "company_invites" ("companyId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_company_invites_email" ON "company_invites" ("email")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_company_invites_tokenHash" ON "company_invites" ("tokenHash")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "company_billing_orders" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "companyId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "plan" character varying(40) NOT NULL,
        "amountInPaise" integer NOT NULL,
        "currency" character varying(10) NOT NULL DEFAULT 'INR',
        "providerOrderId" character varying(120) NOT NULL,
        "paymentId" character varying(120),
        "status" character varying(20) NOT NULL DEFAULT 'created',
        "expiresAt" TIMESTAMP,
        "paidAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_company_billing_orders_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_company_billing_orders_providerOrderId" UNIQUE ("providerOrderId"),
        CONSTRAINT "UQ_company_billing_orders_paymentId" UNIQUE ("paymentId")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_company_billing_orders_companyId" ON "company_billing_orders" ("companyId")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "company_api_keys" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "companyId" uuid NOT NULL,
        "name" character varying(120) NOT NULL,
        "prefix" character varying(32) NOT NULL,
        "keyHash" character varying(128) NOT NULL,
        "scopes" text array NOT NULL DEFAULT '{}',
        "createdByUserId" uuid,
        "lastUsedAt" TIMESTAMP,
        "revokedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_company_api_keys_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_company_api_keys_keyHash" UNIQUE ("keyHash")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_company_api_keys_companyId" ON "company_api_keys" ("companyId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_company_api_keys_prefix" ON "company_api_keys" ("prefix")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_company_api_keys_keyHash" ON "company_api_keys" ("keyHash")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "company_audit_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "companyId" uuid NOT NULL,
        "actorId" uuid,
        "actorEmail" character varying(255),
        "action" character varying(120) NOT NULL,
        "target" character varying(180),
        "severity" character varying(40) NOT NULL DEFAULT 'info',
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_company_audit_logs_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_company_audit_logs_companyId" ON "company_audit_logs" ("companyId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "company_audit_logs"');
    await queryRunner.query('DROP TABLE IF EXISTS "company_api_keys"');
    await queryRunner.query('DROP TABLE IF EXISTS "company_billing_orders"');
    await queryRunner.query('DROP TABLE IF EXISTS "company_invites"');
    await queryRunner.query('DROP TABLE IF EXISTS "company_members"');
    await queryRunner.query('DROP TABLE IF EXISTS "company_profiles"');
  }
}
