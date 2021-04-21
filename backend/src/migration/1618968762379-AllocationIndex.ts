import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllocationIndex1618968762379 implements MigrationInterface {
    name = 'AllocationIndex1618968762379';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX "IDX_ce2aecc88cb064de09d3ab12b9" ON "allocation" ("portfolioId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_1415da4aa2c3aa297fd953184f" ON "allocation" ("parentId")
        `);
        await queryRunner.query(`
            ALTER TABLE "allocation"
            ADD CONSTRAINT "FK_1415da4aa2c3aa297fd953184f6" FOREIGN KEY ("parentId") REFERENCES "allocation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "allocation" DROP CONSTRAINT "FK_1415da4aa2c3aa297fd953184f6"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_1415da4aa2c3aa297fd953184f"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_ce2aecc88cb064de09d3ab12b9"
        `);
    }
}
