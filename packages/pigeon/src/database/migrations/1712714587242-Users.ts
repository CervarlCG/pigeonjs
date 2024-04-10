import { MigrationInterface, QueryRunner } from 'typeorm';
import { datesColumns, idColumns } from './common';

export class Users1712714587242 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS users(
                ${idColumns},
                firstName VARCHAR(50) NOT NULL,
                lastName VARCHAR(50) NOT NULL,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(72) NOT NULL,
                role enum('teammate', 'moderator', 'admin') DEFAULT 'teammate',
                refreshToken VARCHAR(512) NULL,
                ${datesColumns},
                UNIQUE (email)
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
  }
}
