import { MigrationInterface, QueryRunner } from 'typeorm';
import { datesColumns, idColumns } from './common';

export class Workspaces1712714932855 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS workspaces(
                ${idColumns},
                name VARCHAR(100) NOT NULL,
                handle VARCHAR(100) NOT NULL,
                ownerId INT UNSIGNED NOT NULL,
                ${datesColumns},
                UNIQUE (handle),
                CONSTRAINT FK_USER_WORKSPACES FOREIGN KEY (ownerId) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT
            );
        `);
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS worspace_users(
            ${idColumns},
            userId INT UNSIGNED NOT NULL,
            workspaceId INT UNSIGNED NOT NULL,
            ${datesColumns},
            UNIQUE KEY UNIQUE_USERS_AT_WORKSPACES_COMBINATION (userId, workspaceId),
            CONSTRAINT FK_USER_WORKSPACE_USERS FOREIGN KEY (userId) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
            CONSTRAINT FK_WORKSPACE_WORKSPACE_USERS FOREIGN KEY (workspaceId) REFERENCES workspaces(id) ON UPDATE CASCADE ON DELETE RESTRICT
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS worspace_users;`);
    await queryRunner.query(`DROP TABLE IF EXISTS workspaces;`);
  }
}
