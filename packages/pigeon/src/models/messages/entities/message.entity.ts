import { BaseEntity } from 'src/common/database/base-entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from 'src/models/user/entities/user.entity';
import { Channel } from 'src/models/channels/entities/channel.entity';

@Entity('messages')
export class Message extends BaseEntity {
  @Column()
  content: string;

  @Column()
  @ManyToOne(() => User)
  user: User;

  @Column()
  @ManyToOne(() => Channel)
  channel: Channel;
}
