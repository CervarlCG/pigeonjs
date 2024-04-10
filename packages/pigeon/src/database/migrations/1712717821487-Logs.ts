import { MigrationInterface, QueryRunner } from 'typeorm';
import { datesColumns, idColumns } from './common';

export class Logs1712717821487 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        CREATE TABLE IF NOT EXISTS logs (
            ${idColumns},
            requestId CHAR(36) NOT NULL,
            message TEXT NOT NULL,
            level ENUM('INFO', 'WARNING', 'ERROR') NOT NULL,
            trace TEXT NOT NULL,
            ${datesColumns},
            INDEX(requestId),
            INDEX(level)
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`DROP TABLE IF EXISTS logs;`);
  }
}
