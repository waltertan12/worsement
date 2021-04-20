import { MigrationInterface, QueryRunner } from 'typeorm';

export class PortfolioAllocation1618882235640 implements MigrationInterface {
    name = 'PortfolioAllocation1618882235640';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "portfolio" (
                "id" SERIAL NOT NULL,
                "userId" integer,
                "name" character varying NOT NULL,
                "description" character varying,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_6936bb92ca4b7cda0ff28794e48" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9d041c43c782a9135df1388ae1" ON "portfolio" ("userId")
        `);
        await queryRunner.query(`
            CREATE TABLE "allocation" (
                "id" SERIAL NOT NULL,
                "parentId" integer,
                "equity" character varying,
                "description" character varying,
                "ratio" real NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "portfolioId" integer,
                CONSTRAINT "PK_7df89c736595e454b6ae07264fe" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "allocation"
            ADD CONSTRAINT "FK_ce2aecc88cb064de09d3ab12b95" FOREIGN KEY ("portfolioId") REFERENCES "portfolio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "allocation" DROP CONSTRAINT "FK_ce2aecc88cb064de09d3ab12b95"
        `);
        await queryRunner.query(`
            DROP TABLE "allocation"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_9d041c43c782a9135df1388ae1"
        `);
        await queryRunner.query(`
            DROP TABLE "portfolio"
        `);
    }
}
