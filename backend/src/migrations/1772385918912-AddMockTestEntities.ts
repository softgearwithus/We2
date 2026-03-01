import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMockTestEntities1772385918912 implements MigrationInterface {
    name = 'AddMockTestEntities1772385918912'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."mock_test_questions_questiontype_enum" AS ENUM('MCQ', 'TEXT')`);
        await queryRunner.query(`CREATE TABLE "mock_test_questions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "sectionId" uuid NOT NULL, "questionType" "public"."mock_test_questions_questiontype_enum" NOT NULL DEFAULT 'MCQ', "questionText" text NOT NULL, "optionsJson" jsonb, "correctAnswer" character varying, "marks" integer, "order" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f1f38506a83f135032e40d9e903" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mock_test_sections" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "mockTestId" uuid NOT NULL, "title" character varying NOT NULL, "durationMinutes" integer, "order" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_00e9dd7abd59dec70d429cc6cf6" PRIMARY KEY ("id")); COMMENT ON COLUMN "mock_test_sections"."durationMinutes" IS 'Strict timer for this section in minutes, if null it uses global timer'`);
        await queryRunner.query(`CREATE TABLE "mock_tests" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "companyId" uuid NOT NULL, "title" character varying NOT NULL, "description" text, "totalDurationMinutes" integer NOT NULL DEFAULT '0', "order" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_10d21ba23138d224c258d5508c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "mock_test_questions" ADD CONSTRAINT "FK_78406b54dbc4da337e708893f6c" FOREIGN KEY ("sectionId") REFERENCES "mock_test_sections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mock_test_sections" ADD CONSTRAINT "FK_52da1b9e921610e4b7769f2042e" FOREIGN KEY ("mockTestId") REFERENCES "mock_tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mock_tests" ADD CONSTRAINT "FK_05928b41c2a71b22d2bf6ac2aca" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mock_tests" DROP CONSTRAINT "FK_05928b41c2a71b22d2bf6ac2aca"`);
        await queryRunner.query(`ALTER TABLE "mock_test_sections" DROP CONSTRAINT "FK_52da1b9e921610e4b7769f2042e"`);
        await queryRunner.query(`ALTER TABLE "mock_test_questions" DROP CONSTRAINT "FK_78406b54dbc4da337e708893f6c"`);
        await queryRunner.query(`DROP TABLE "mock_tests"`);
        await queryRunner.query(`DROP TABLE "mock_test_sections"`);
        await queryRunner.query(`DROP TABLE "mock_test_questions"`);
        await queryRunner.query(`DROP TYPE "public"."mock_test_questions_questiontype_enum"`);
    }

}
