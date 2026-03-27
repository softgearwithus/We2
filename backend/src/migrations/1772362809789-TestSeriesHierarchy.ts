import { MigrationInterface, QueryRunner } from 'typeorm';

export class TestSeriesHierarchy1772362809789 implements MigrationInterface {
  name = 'TestSeriesHierarchy1772362809789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(120) NOT NULL, "logoUrl" character varying(255), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3dacbb3eb4f095e29372ff8e131" UNIQUE ("name"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "test_modules" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "companyId" uuid NOT NULL, "title" character varying(160) NOT NULL, "description" text, "order" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0ff1300932d89ec8f6e69661245" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "test_chapters" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "moduleId" uuid NOT NULL, "title" character varying(160) NOT NULL, "order" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f9c74664653d68bf80465839c86" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."test_question_links_questiontype_enum" AS ENUM('MCQ', 'WRITEX')`,
    );
    await queryRunner.query(
      `CREATE TABLE "test_question_links" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "chapterId" uuid NOT NULL, "questionId" uuid NOT NULL, "questionType" "public"."test_question_links_questiontype_enum" NOT NULL, "order" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d4b6c0f99f523c24aeec6831c30" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ab0734f5cf344763cf10d00ddf" ON "test_question_links" ("chapterId", "questionId", "questionType") `,
    );
    await queryRunner.query(
      `ALTER TABLE "test_modules" ADD CONSTRAINT "FK_9cc031aa35d46f72e04b8bf5191" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "test_chapters" ADD CONSTRAINT "FK_b413c34f07868b97ca673accf41" FOREIGN KEY ("moduleId") REFERENCES "test_modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "test_question_links" ADD CONSTRAINT "FK_dace026a0ac0a1408b87358a6e0" FOREIGN KEY ("chapterId") REFERENCES "test_chapters"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "test_question_links" DROP CONSTRAINT "FK_dace026a0ac0a1408b87358a6e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "test_chapters" DROP CONSTRAINT "FK_b413c34f07868b97ca673accf41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "test_modules" DROP CONSTRAINT "FK_9cc031aa35d46f72e04b8bf5191"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ab0734f5cf344763cf10d00ddf"`,
    );
    await queryRunner.query(`DROP TABLE "test_question_links"`);
    await queryRunner.query(
      `DROP TYPE "public"."test_question_links_questiontype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "test_chapters"`);
    await queryRunner.query(`DROP TABLE "test_modules"`);
    await queryRunner.query(`DROP TABLE "companies"`);
  }
}
