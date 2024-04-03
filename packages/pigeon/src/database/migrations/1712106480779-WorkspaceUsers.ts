import { MigrationInterface, QueryRunner } from 'typeorm';
import { commonTableScheme } from './common';

export class WorkspaceUsers1712106480779 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
            CREATE TABLE IF NOT EXISTS workspaces_users_users (
                ${commonTableScheme}
                userId INT UNSIGNED NOT NULL,
                workspaceId INT UNSIGNED NOT NULL,
                CONSTRAINT FK_WORKSPACES_USERS_WORKSPACE FOREIGN KEY (workspaceId) REFERENCES workspaces(id),
                CONSTRAINT FK_WORKSPACES_USERS_USER FOREIGN KEY (userId) REFERENCES users(id)
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`DROP TABLE IF EXISTS workspaces_users_users;`);
  }
}
