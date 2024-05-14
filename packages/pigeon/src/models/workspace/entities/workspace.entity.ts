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
    name: 'workspace_users',
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
