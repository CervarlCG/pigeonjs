import { BaseEntity } from 'src/common/database/base-entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from 'src/models/user/entities/user.entity';
import { Channel } from '../../channels/entities/channel.entity';

export const WORKSPACE_TO_USERS_TABLE = 'workspace_users';

@Entity('workspaces')
export class Workspace extends BaseEntity {
  @Column()
  name: string;

  @Column()
  handle: string;

  @ManyToOne(() => User)
  @JoinColumn()
  owner: User;

  @ManyToMany(() => User)
  @JoinTable({
    name: WORKSPACE_TO_USERS_TABLE,
    joinColumn: {
      name: 'workspaceId',
    },
    inverseJoinColumn: {
      name: 'userId',
    },
  })
  users: User[];

  @OneToMany(() => Channel, (channel) => channel.workspace, {
    cascade: true,
  })
  channels: Channel[];
}
