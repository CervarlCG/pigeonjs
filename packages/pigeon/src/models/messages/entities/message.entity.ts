import { BaseEntity } from 'src/common/database/base-entity';
import { Column, Entity, JoinTable, ManyToOne, OneToMany } from 'typeorm';
import { User } from 'src/models/user/entities/user.entity';
import { Channel } from 'src/models/channels/entities/channel.entity';
import { MessageAttachment } from './attachment';

export const MESSAGES_ATTACHMENTS_TABLE = 'messages_attachments';

@Entity('messages')
export class Message extends BaseEntity {
  @Column()
  content: string;

  @OneToMany(() => MessageAttachment, (attachment) => attachment.message)
  attachments: MessageAttachment[];

  @ManyToOne(() => User, (user) => user.messages)
  user: User;

  @ManyToOne(() => Channel, (channel) => channel.messages)
  channel: Channel;
}
