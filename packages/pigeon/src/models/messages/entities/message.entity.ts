import { BaseEntity } from 'src/common/database/base-entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from 'src/models/user/entities/user.entity';
import { Channel } from 'src/models/channels/entities/channel.entity';

@Entity('messages')
export class Message extends BaseEntity {
  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.messages)
  user: User;

  @ManyToOne(() => Channel, (channel) => channel.messages)
  channel: Channel;
}
