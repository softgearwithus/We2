import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMockQuestions1772394751180 implements MigrationInterface {
  name = 'UpdateMockQuestions1772394751180';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "mock_test_results" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "start_time" TIMESTAMP NOT NULL, "end_time" TIMESTAMP, "total_marks" integer NOT NULL DEFAULT '0', "marks_obtained" numeric(5,2) NOT NULL DEFAULT '0', "is_evaluated" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "mock_test_id" uuid, CONSTRAINT "PK_59cc7096430ef5b184246c8f272" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "mock_test_student_responses" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "time_spent_seconds" integer NOT NULL DEFAULT '0', "response_value" text, "is_correct" boolean, "marks_awarded" numeric(5,2) NOT NULL DEFAULT '0', "ai_feedback" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "mock_test_result_id" uuid, "question_id" uuid, CONSTRAINT "PK_0ad5ca114b646932f742327f4d4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_questions" ADD COLUMN IF NOT EXISTS "solutionText" text`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."mock_test_questions_questiontype_enum" ADD VALUE IF NOT EXISTS 'SINGLE_CORRECT'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."mock_test_questions_questiontype_enum" ADD VALUE IF NOT EXISTS 'MULTI_CORRECT'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."mock_test_questions_questiontype_enum" ADD VALUE IF NOT EXISTS 'CODE'`,
    );
    await queryRunner.query(
      `UPDATE "mock_test_questions" SET "questionType" = 'SINGLE_CORRECT' WHERE "questionType"::text = 'MCQ'`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_questions" ALTER COLUMN "questionType" SET DEFAULT 'SINGLE_CORRECT'`,
    );
    await queryRunner.query(
      `DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'mock_test_questions' AND column_name = 'correctAnswer' AND data_type = 'character varying') THEN ALTER TABLE "mock_test_questions" ALTER COLUMN "correctAnswer" TYPE text USING "correctAnswer"::text; END IF; END $$`,
    );
    await queryRunner.query(
      `UPDATE "mock_test_questions" SET "marks" = 1 WHERE "marks" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_questions" ALTER COLUMN "marks" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_questions" ALTER COLUMN "marks" SET DEFAULT '1'`,
    );
    await queryRunner.query(
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_db756e7e576966fd576d1886019') THEN ALTER TABLE "mock_test_results" ADD CONSTRAINT "FK_db756e7e576966fd576d1886019" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION; END IF; END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_6d0af87c0d83a66496ec059902a') THEN ALTER TABLE "mock_test_results" ADD CONSTRAINT "FK_6d0af87c0d83a66496ec059902a" FOREIGN KEY ("mock_test_id") REFERENCES "mock_tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION; END IF; END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_a7221cac2677710d3798bd4dc80') THEN ALTER TABLE "mock_test_student_responses" ADD CONSTRAINT "FK_a7221cac2677710d3798bd4dc80" FOREIGN KEY ("mock_test_result_id") REFERENCES "mock_test_results"("id") ON DELETE CASCADE ON UPDATE NO ACTION; END IF; END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_89acc0ef976186aa70fe822f9e7') THEN ALTER TABLE "mock_test_student_responses" ADD CONSTRAINT "FK_89acc0ef976186aa70fe822f9e7" FOREIGN KEY ("question_id") REFERENCES "mock_test_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION; END IF; END $$`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "mock_test_student_responses" DROP CONSTRAINT "FK_89acc0ef976186aa70fe822f9e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_student_responses" DROP CONSTRAINT "FK_a7221cac2677710d3798bd4dc80"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_results" DROP CONSTRAINT "FK_6d0af87c0d83a66496ec059902a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_results" DROP CONSTRAINT "FK_db756e7e576966fd576d1886019"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_questions" ALTER COLUMN "marks" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_questions" ALTER COLUMN "marks" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_questions" DROP COLUMN "correctAnswer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_questions" ADD "correctAnswer" character varying`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."mock_test_questions_questiontype_enum_old" AS ENUM('MCQ', 'TEXT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_questions" ALTER COLUMN "questionType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_questions" ALTER COLUMN "questionType" TYPE "public"."mock_test_questions_questiontype_enum_old" USING (CASE WHEN "questionType"::text = 'SINGLE_CORRECT' THEN 'MCQ' ELSE "questionType"::text END)::"public"."mock_test_questions_questiontype_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_questions" ALTER COLUMN "questionType" SET DEFAULT 'MCQ'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."mock_test_questions_questiontype_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."mock_test_questions_questiontype_enum_old" RENAME TO "mock_test_questions_questiontype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_questions" DROP COLUMN "solutionText"`,
    );
    await queryRunner.query(`DROP TABLE "mock_test_student_responses"`);
    await queryRunner.query(`DROP TABLE "mock_test_results"`);
  }
}
