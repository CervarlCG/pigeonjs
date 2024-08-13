import { BaseEntity } from 'src/common/database/base-entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Message } from './message.entity';

@Entity('messages_attachments')
export class MessageAttachment extends BaseEntity {
  @Column()
  url: string;

  @Column()
  previewURL: string;

  @Column()
  mimetype: string;

  @ManyToOne(() => Message, (message) => message.attachments)
  message: Message;
}
