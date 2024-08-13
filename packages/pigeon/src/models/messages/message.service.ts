import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { RemoveOptions, Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { EntityID } from 'src/common/types/id';
import { UserService } from '../user/user.service';
import { ChannelService } from '../channels/channel.service';
import { parseID } from 'src/common/utils/id';
import { ResourceNotFoundException } from 'src/common/exceptions/system';
import { merge } from 'lodash';
import { defaultRemoveOptions } from 'src/common/constants/repository';
import { PaginationService } from '../pagination/pagination.service';
import { FileType } from 'src/common/types/file';
import { MessageAttachment } from './entities/attachment';
import { MessageAttachmentService } from './message-attachments.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(MessageAttachment)
    private readonly messageAttachmentRepository: Repository<MessageAttachment>,
    private readonly messageAttachmentService: MessageAttachmentService,
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
    private readonly paginationService: PaginationService,
  ) {}

  /**
   * Search for messages on a channel
   * @param channelId The channel where the system will search
   * @param searchTerm The search parameter
   * @param after start cursor of the page
   * @returns An object containing messages and the next cursor if it is not the last
   */
  async search(channelId: EntityID, searchTerm?: string, after?: string) {
    const { data, next } = await this.paginationService.findWithCursor<Message>(
      (options) => {
        const query = this.messageRepository
          .createQueryBuilder('messages')
          .leftJoinAndSelect('messages.user', 'user')
          .leftJoinAndSelect('messages.channel', 'channel')
          .leftJoinAndSelect('messages.attachments', 'attachments')
          .select()
          .where('channelId = :channelId', { channelId });

        if (searchTerm)
          query.andWhere(
            'MATCH (messages.content) AGAINST(:searchTerm IN BOOLEAN MODE)',
            {
              searchTerm,
            },
          );

        if (options.cursor)
          query.andWhere('messages.id <= :messageId', {
            messageId: options.cursor,
          });

        return query
          .take(options.limit)
          .orderBy('messages.id', 'DESC')
          .getMany();
      },
      { after },
    );

    return {
      messages: data,
      next,
    };
  }

  /**
   * Get an instance of a channel
   * @param channel The channel ID or entity
   * @returns An instance of the channel if it exists.
   */
  private async getMessage(channel: EntityID | Message) {
    if (channel instanceof Message) return channel;
    return this.findById(channel);
  }

  /**
   * Find a instance of a channel
   * @param id The channel ID
   * @returns An instance of the channel if it exists.
   */
  async findById(id: EntityID) {
    return this.messageRepository.findOne({
      where: { id },
      relations: { user: true, channel: true, attachments: true },
      select: {
        user: this.userService.getRelationColums(),
        channel: this.channelService.getRelationColums(),
      },
    });
  }

  /**
   * Creates a message
   * @param messageData The message data
   * @param userId The owner
   * @returns An instance of the message created
   */
  async create(
    messageData: CreateMessageDto & {
      channelId: string;
      attachments?: FileType[];
    },
    userId: EntityID,
  ) {
    const user = await this.userService.findById(userId);
    const channel = await this.channelService.findById(
      parseID(messageData.channelId),
      { relations: { users: false } },
    );

    if (!user) throw new ResourceNotFoundException("User doesn't exist");
    if (!channel) throw new ResourceNotFoundException("Channel doesn't exist");

    const message = this.messageRepository.create({
      user,
      channel,
      content: messageData.message,
    });

    const messageEntity = await this.messageRepository.save(message);

    return {
      ...messageEntity,
      attachments: await this.messageAttachmentService.uploadAttachments(
        messageData.attachments || [],
        message,
      ),
    };
  }

  /**
   * Updated a message content
   * @param id The message ID
   * @param message The message content
   * @returns A instance of the message updated
   */
  async update(id: EntityID, message: string): Promise<Message> {
    const updated = await this.messageRepository.update(
      { id },
      { content: message },
    );
    const messageUpdated = await this.findById(id);

    if (
      updated.affected === undefined ||
      updated.affected <= 0 ||
      !messageUpdated
    )
      throw new ResourceNotFoundException('Message not found');

    return messageUpdated;
  }

  /**
   * Removes a message
   * @param id The message ID
   * @param options_ The remove options
   */
  async remove(id: EntityID | Message, options_?: RemoveOptions) {
    const options = merge(defaultRemoveOptions, options_);
    const message = await this.getMessage(id);
    if (!message) return;
    if (options.soft) await this.messageRepository.softRemove([message]);
    else await this.messageRepository.remove([message]);
  }

  /**
   * Converts a message entity into a data transfer object.
   * @param workspace The message entity to convert.
   * @returns The message data transfer object.
   */
  toDto(message: Message) {
    return {
      id: message.id,
      content: message.content,
      channel: this.channelService.toDto(message.channel),
      user: this.userService.toDto(message.user),
      createdAt: message.createdAt,
      attachments:
        message.attachments.map((attch) => ({
          id: attch.id,
          createdAt: attch.createdAt,
          url: attch.url,
          previewURL: attch.previewURL,
          mimetype: attch.mimetype,
        })) || [],
    };
  }
}
