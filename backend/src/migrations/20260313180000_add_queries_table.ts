import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQueriesTable20260313180000 implements MigrationInterface {
  name = 'AddQueriesTable20260313180000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "queries" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" character varying(255) NOT NULL,
        "email" character varying(255) NOT NULL,
        "subject" character varying(255) NOT NULL,
        "companyName" character varying(255),
        "message" text NOT NULL,
        "status" character varying(50) NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedDate" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "queries"');
  }
}
