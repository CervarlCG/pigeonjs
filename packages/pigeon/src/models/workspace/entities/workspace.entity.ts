import { BaseEntity } from 'src/common/database/base-entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { User } from 'src/models/user/entities/user.entity';

@Entity('workspaces')
export class Workspace extends BaseEntity {
  @Column()
  name: string;

  @Column()
  handle: string;

  @ManyToOne(() => User)
  @JoinColumn()
  owner: User;

  @ManyToMany(() => User, { cascade: true })
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
}
