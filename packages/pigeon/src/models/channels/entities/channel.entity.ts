import { BaseEntity } from 'src/common/database/base-entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Privacy } from 'src/common/constants/private';
import { Workspace } from 'src/models/workspace/entities/workspace.entity';

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
}
