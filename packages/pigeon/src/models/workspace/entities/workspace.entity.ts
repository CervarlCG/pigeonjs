import { BaseEntity } from 'src/common/database/base-entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
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
}
