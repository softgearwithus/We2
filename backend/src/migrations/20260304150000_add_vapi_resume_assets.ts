import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVapiResumeAssets20260304150000 implements MigrationInterface {
  name = 'AddVapiResumeAssets20260304150000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vapi_resume_assets" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "fileName" character varying(255),
        "fileType" character varying(50),
        "vapiFileId" character varying(80) NOT NULL,
        "vapiToolId" character varying(80) NOT NULL,
        "vapiToolName" character varying(80) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_vapi_resume_assets_userId" ON "vapi_resume_assets" ("userId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "vapi_resume_assets"');
  }
}
