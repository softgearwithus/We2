import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDsaSqlUsageTables20260327121500 implements MigrationInterface {
  name = 'RemoveDsaSqlUsageTables20260327121500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TABLE IF EXISTS "dsa_problem_insights" CASCADE',
    );
    await queryRunner.query(
      'DROP TABLE IF EXISTS "dsa_training_sessions" CASCADE',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "dsa_user_states" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "dsa_submissions" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "dsa_problems" CASCADE');

    await queryRunner.query(
      'DROP TABLE IF EXISTS "sql_problem_insights" CASCADE',
    );
    await queryRunner.query(
      'DROP TABLE IF EXISTS "sql_training_sessions" CASCADE',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "sql_user_states" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "sql_submissions" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "sql_problems" CASCADE');

    await queryRunner.query(
      'DROP TABLE IF EXISTS "user_section_usage" CASCADE',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    void queryRunner;
  }
}
