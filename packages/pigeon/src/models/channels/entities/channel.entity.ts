import { BaseEntity } from 'src/common/database/base-entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Privacy } from 'src/common/constants/private';
import { Workspace } from 'src/models/workspace/entities/workspace.entity';
import { User } from 'src/models/user/entities/user.entity';

export const CHANNEL_TO_USERS_TABLE = 'channel_users';

@Entity('channels')
export class Channel extends BaseEntity {
  @Column()
  name: string;

  @Column()
  handle: string;

  @Column({ type: 'enum', enum: Privacy, default: Privacy.PRIVATE })
  privacy: Privacy;

  @Column()
  isDM: boolean;

  @ManyToOne(() => Workspace)
  workspace: Workspace;

  @ManyToMany(() => User)
  @JoinTable({
    name: CHANNEL_TO_USERS_TABLE,
    joinColumn: {
      name: 'channelId',
    },
    inverseJoinColumn: {
      name: 'userId',
    },
  })
  users: User[];
}
