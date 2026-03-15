import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMcqTopicColumns20260315154000 implements MigrationInterface {
    name = 'AddMcqTopicColumns20260315154000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "mcq_question" ADD COLUMN IF NOT EXISTS "topicKey" character varying(120)');
        await queryRunner.query('ALTER TABLE "mcq_question" ADD COLUMN IF NOT EXISTS "topicLabel" character varying(160)');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "mcq_question" DROP COLUMN IF EXISTS "topicLabel"');
        await queryRunner.query('ALTER TABLE "mcq_question" DROP COLUMN IF EXISTS "topicKey"');
    }
}
