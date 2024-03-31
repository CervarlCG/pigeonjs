import { MigrationInterface, QueryRunner } from "typeorm";

export class UserRole1711856314074 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`ALTER TABLE users ADD COLUMN role enum('teammate', 'moderator', 'admin') default 'teammate'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`ALTER TABLE users DROP COLUMN role`);
    }

}
