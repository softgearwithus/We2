import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResumeTitle20260317172000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Safe check to prevent crashing local instances where synchronize: true might have already added it
        const hasColumn = await queryRunner.hasColumn('resume', 'title');
        if (!hasColumn) {
            await queryRunner.query(`ALTER TABLE "resume" ADD "title" character varying(255) NOT NULL DEFAULT 'Untitled Resume'`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasColumn = await queryRunner.hasColumn('resume', 'title');
        if (hasColumn) {
            await queryRunner.query(`ALTER TABLE "resume" DROP COLUMN "title"`);
        }
    }
}
