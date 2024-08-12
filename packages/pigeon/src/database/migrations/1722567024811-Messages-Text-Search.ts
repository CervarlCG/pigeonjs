import { MigrationInterface, QueryRunner } from "typeorm";

export class MessagesTextSearch1722567024811 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE messages ADD FULLTEXT messages_fulltext_content_index (content);`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE messages DROP INDEX messages_fulltext_content_index;
    `);
  }

}
