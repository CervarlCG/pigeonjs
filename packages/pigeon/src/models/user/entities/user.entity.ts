import { BaseEntity } from "src/common/database/base-entity";
import { Column, Entity } from "typeorm";
import { UserRoles } from "pigeon-types";

@Entity("users")
export class User extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({type: 'varchar', nullable: true})
  refreshToken: string | null;

  @Column({
    type: "enum",
    enum: UserRoles,
    default: UserRoles.TEAM_MATE
  })
  role: string;
}