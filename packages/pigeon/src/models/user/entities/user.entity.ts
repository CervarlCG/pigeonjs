import { BaseEntity } from 'src/common/database/base-entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { UserRoles } from 'pigeon-types/dist/enums/user';
import { Message } from 'src/models/messages/entities/message.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string | null;

  @Column({
    type: 'enum',
    enum: UserRoles,
    default: UserRoles.TEAM_MATE,
  })
  role: UserRoles;

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];
}
