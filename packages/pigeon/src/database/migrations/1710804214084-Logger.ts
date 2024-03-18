import { MigrationInterface, QueryRunner } from "typeorm";
import { commonTableScheme } from "./common";

export class Logger1710804214084 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log(`
            CREATE TABLE logs IF NOT EXISTS (
                ${commonTableScheme}
                requestId CHAR(36) NOT NULL INDEX,
                requestPath VARCHAR(2083) NOT NULL,
                requestType ENUM('RESTAPI', 'SYSTEM') NOT NULL,
                message TEXT NOT NULL default 'SERVER_ERROR_DEFAULT',
                level ENUM('INFO', 'WARNING', 'ERROR') NOT NULL INDEX,
                trace TEXT NOT NULL default 'NO_TRACE'
            );
        `)
        queryRunner.query(`
            CREATE TABLE IF NOT EXISTS logs (
                ${commonTableScheme}
                requestId CHAR(36) NOT NULL,
                requestPath VARCHAR(2083) NOT NULL,
                requestType ENUM('RESTAPI', 'SYSTEM') NOT NULL,
                message TEXT NOT NULL,
                level ENUM('INFO', 'WARNING', 'ERROR') NOT NULL,
                trace TEXT NOT NULL,

                INDEX(requestId),
                INDEX(level)
            );
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`DROP TABLE IF EXISTS logs;`);
    }

}
