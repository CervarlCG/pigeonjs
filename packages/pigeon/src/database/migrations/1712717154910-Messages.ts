import { MigrationInterface, QueryRunner } from 'typeorm';
import { datesColumns, idColumns } from './common';

export class Messages1712717154910 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS messages(
            ${idColumns},
            content VARCHAR(10000) NOT NULL,
            userId INT UNSIGNED NOT NULL,
            channelId INT UNSIGNED NOT NULL,
            ${datesColumns},
            CONSTRAINT FK_USERS_MESSAGES FOREIGN KEY (userId) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
            CONSTRAINT FK_CHANNELS_MESSAGES FOREIGN KEY (channelId) REFERENCES channels(id) ON UPDATE CASCADE ON DELETE RESTRICT
        );
    `);

    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS messages_attachments(
            ${idColumns},
            url VARCHAR(255) NOT NULL,
            previewURL VARCHAR(255) NOT NULL,
            mimetype VARCHAR(255) NOT NULL,
            messageId INT UNSIGNED NOT NULL,
            ${datesColumns},
            CONSTRAINT FK_MESSAGES_MESSAGES_ATTACHMENTS FOREIGN KEY (messageId) REFERENCES messages(id) ON UPDATE CASCADE ON DELETE RESTRICT
        );
    `);

    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS saved_messages(
            ${idColumns},
            messageId INT UNSIGNED NOT NULL,
            userId INT UNSIGNED NOT NULL,
            ${datesColumns},
            UNIQUE KEY UNIQUE_SAVED_MESSAGE_PER_USER (messageId, userId),
            CONSTRAINT FK_USER_SAVED_MESSAGE FOREIGN KEY (userId) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
            CONSTRAINT FK_MESSAGE_SAVED_MESSAGE FOREIGN KEY (messageId) REFERENCES messages(id) ON UPDATE CASCADE ON DELETE RESTRICT
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS saved_messages;`);
    await queryRunner.query(`DROP TABLE IF EXISTS messages_attachments;`);
    await queryRunner.query(`DROP TABLE IF EXISTS messages;`);
  }
}
