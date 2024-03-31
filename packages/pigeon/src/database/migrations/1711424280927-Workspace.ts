import { MigrationInterface, QueryRunner } from "typeorm";
import { commonTableScheme } from "./common";

export class Workspace1711424280927 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            CREATE TABLE IF NOT EXISTS workspaces (
                ${commonTableScheme}
                name VARCHAR(100) NOT NULL,
                handle VARCHAR(100) NOT NULL,
                ownerId INT UNSIGNED NOT NULL,
                CONSTRAINT FK_USER_WORKSPACE FOREIGN KEY (ownerId) REFERENCES users(id)
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`DROP TABLE IF EXISTS workspaces;`);
    }

}
