import { Injectable } from '@nestjs/common';
import { FileType } from 'src/common/types/file';
import { Message } from './entities/message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageAttachment } from './entities/attachment';
import { Repository } from 'typeorm';
import * as sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { imageMimeTypeRegex } from 'src/config/files';

@Injectable()
export class MessageAttachmentService {
  constructor(
    @InjectRepository(MessageAttachment)
    private readonly messageAttachmentRepository: Repository<MessageAttachment>,
  ) {}

  /**
   * Upload the attachment of a message
   * @param attachments The attachment files
   * @param message The message owner
   * @returns A list of attachments instances
   */
  async uploadAttachments(attachments: FileType[], message: Message) {
    const attachmentsPromises = [];

    for (const attch of attachments) {
      const attachment = this.messageAttachmentRepository.create({
        message,
        url: attch.path,
        mimetype: attch.mimetype,
        previewURL: await this.generateFilePreview(attch).catch((err) => {
          console.error(err);
          return '';
        }),
      });
      attachmentsPromises.push(
        this.messageAttachmentRepository.save(attachment),
      );
    }

    return Promise.all(attachmentsPromises);
  }

  /**
   * Generate a preview for a file
   * @param file The file
   * @returns A string containing the preview url
   */
  async generateFilePreview(file: FileType): Promise<string> {
    if (imageMimeTypeRegex.test(file.mimetype))
      return this.generateImagePreview(file);
    return '';
  }

  /**
   * Generate a preview for a image
   * @param file The image
   * @returns A string containing the preview url
   */
  async generateImagePreview(file: FileType) {
    const image = await fs.readFile(file.path);
    const imageResized = await sharp(image).resize(100, 100).toBuffer();
    const paths = file.path.split(path.sep);
    paths.splice(paths.length - 1, 0, 'previews');
    const newPath = paths.join(path.sep);

    await fs
      .mkdir(paths.slice(0, paths.length - 1).join(path.sep), {
        recursive: true,
      })
      .catch(() => {});

    await fs.writeFile(newPath, imageResized, {});
    return newPath;
  }
}
