import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeMockTestNullable1773565453274 implements MigrationInterface {
  name = 'MakeMockTestNullable1773565453274';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "write_x_question" ADD "topicKey" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "write_x_question" ADD "topicLabel" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_results" DROP CONSTRAINT "FK_6d0af87c0d83a66496ec059902a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_student_responses" DROP CONSTRAINT "FK_89acc0ef976186aa70fe822f9e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_results" ADD "result_type" character varying NOT NULL DEFAULT 'mock_test'`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_results" ADD "subject" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_results" ADD "topic" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_results" ADD "title_snapshot" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_student_responses" ADD "subject_mcq_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "mcq_question" ADD "topicDurationMinutes" integer NOT NULL DEFAULT '60'`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_results" ADD CONSTRAINT "FK_6d0af87c0d83a66496ec059902a" FOREIGN KEY ("mock_test_id") REFERENCES "mock_tests"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_student_responses" ADD CONSTRAINT "FK_89acc0ef976186aa70fe822f9e7" FOREIGN KEY ("question_id") REFERENCES "mock_test_questions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "write_x_question" DROP COLUMN "topicLabel"`,
    );
    await queryRunner.query(
      `ALTER TABLE "write_x_question" DROP COLUMN "topicKey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_student_responses" DROP CONSTRAINT "FK_89acc0ef976186aa70fe822f9e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_results" DROP CONSTRAINT "FK_6d0af87c0d83a66496ec059902a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mcq_question" DROP COLUMN "topicDurationMinutes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_student_responses" DROP COLUMN "subject_mcq_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_results" DROP COLUMN "title_snapshot"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_results" DROP COLUMN "topic"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_results" DROP COLUMN "subject"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_results" DROP COLUMN "result_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_student_responses" ADD CONSTRAINT "FK_89acc0ef976186aa70fe822f9e7" FOREIGN KEY ("question_id") REFERENCES "mock_test_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mock_test_results" ADD CONSTRAINT "FK_6d0af87c0d83a66496ec059902a" FOREIGN KEY ("mock_test_id") REFERENCES "mock_tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
