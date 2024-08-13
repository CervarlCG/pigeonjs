import { Injectable } from '@nestjs/common';
import { FileType } from 'src/common/types/file';
import { Message } from './entities/message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageAttachment } from './entities/attachment';
import { Repository } from 'typeorm';

@Injectable()
export class MessageAttachmentService {
  constructor(
    @InjectRepository(MessageAttachment)
    private readonly messageAttachmentRepository: Repository<MessageAttachment>,
  ) {}

  async uploadAttachments(attachments: FileType[], message: Message) {
    const attachmentsPromises =
      attachments?.map((attch) => {
        const attachment = this.messageAttachmentRepository.create({
          message,
          url: attch.path,
          mimetype: attch.mimetype,
          previewURL: '',
        });
        return this.messageAttachmentRepository.save(attachment);
      }) || [];

    return Promise.all(attachmentsPromises);
  }
}
