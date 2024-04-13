import { MigrationInterface, QueryRunner } from 'typeorm';
import { datesColumns, idColumns } from './common';

export class Channels1712716040487 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS channels(
            ${idColumns},
            name VARCHAR(50) NOT NULL,
            handle VARCHAR(50) NOT NULL,
            privacy ENUM('public', 'private') NOT NULL DEFAULT 'public',
            isDM TINYINT NOT NULL DEFAULT 0,
            workspaceId INT UNSIGNED NOT NULL,
            ${datesColumns},
            UNIQUE KEY UNIQUE_WORKSPACE_HANDLE (handle, workspaceId),
            CONSTRAINT FK_WORKSPACES_CHANNELS FOREIGN KEY (workspaceId) REFERENCES workspaces(id) ON UPDATE CASCADE ON DELETE RESTRICT
        );
    `);
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS workspace_channels(
            ${idColumns},
            workspaceId INT UNSIGNED NOT NULL,
            channelId INT UNSIGNED NOT NULL,
            ${datesColumns},
            UNIQUE KEY UNIQUE_CHANNEL_AT_WORKSPACES_COMBINATION (channelId, workspaceId),
            CONSTRAINT FK_WORKSPACE_WORKSPACE_CHANNELS FOREIGN KEY (workspaceId) REFERENCES workspaces(id) ON UPDATE CASCADE ON DELETE RESTRICT,
            CONSTRAINT FK_CHANNEL_WORKSPACE_CHANNELS FOREIGN KEY (channelId) REFERENCES channels(id) ON UPDATE CASCADE ON DELETE RESTRICT
        );
    `);

    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS channel_users(
            ${idColumns},
            userId INT UNSIGNED NOT NULL,
            channelId INT UNSIGNED NOT NULL,
            ${datesColumns},
            UNIQUE KEY UNIQUE_USER_AT_CHANNELS_COMBINATION (channelId, userId),
            CONSTRAINT FK_CHANNEL_CHANNEL_USER FOREIGN KEY (channelId) REFERENCES channels(id) ON UPDATE CASCADE ON DELETE RESTRICT,
            CONSTRAINT FK_USER_CHANNEL_USERS FOREIGN KEY (userId) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS channel_users;`);
    await queryRunner.query(`DROP TABLE IF EXISTS workspace_channels;`);
    await queryRunner.query(`DROP TABLE IF EXISTS channels;`);
  }
}
