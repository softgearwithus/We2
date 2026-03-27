import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminActivityLogs20260315103000 implements MigrationInterface {
  name = 'AddAdminActivityLogs20260315103000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "admin_activity_logs" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "actorId" uuid, "actorName" character varying(180) NOT NULL, "action" character varying(120) NOT NULL, "target" character varying(180), "severity" character varying(40) NOT NULL DEFAULT 'info', "metadata" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_admin_activity_logs_id" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "admin_activity_logs"');
  }
}
