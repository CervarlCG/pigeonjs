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

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
  ) {}

  async search() {}

  private async getMessage(channel: EntityID | Message) {
    if (channel instanceof Message) return channel;
    return this.findById(channel);
  }

  async findById(id: EntityID) {
    return this.messageRepository.findOne({
      where: { id },
      relations: { user: true, channel: true },
      select: {
        user: this.userService.getRelationColums(),
        channel: this.channelService.getRelationColums(),
      },
    });
  }

  async create(messageData: CreateMessageDto, userId: EntityID) {
    const user = await this.userService.findById(userId);
    const channel = await this.channelService.findById(
      parseID(messageData.channelId),
      {relations: { users: false }}
    );

    if (!user) throw new ResourceNotFoundException("User doesn't exist");
    if (!channel) throw new ResourceNotFoundException("Channel doesn't exist");

    const message = this.messageRepository.create({
      user,
      channel,
      content: messageData.message,
    });

    return this.messageRepository.save(message);
  }

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

  async remove(id: EntityID | Message, options_?: RemoveOptions) {
    const options = merge(defaultRemoveOptions, options_);
    const message = await this.getMessage(id);
    if (!message) return;
    if (options.soft) await this.messageRepository.softRemove([message]);
    else await this.messageRepository.remove([message]);
  }

  toDto(message: Message) {
    return {
      id: message.id,
      content: message.content,
      channel: this.channelService.toDto(message.channel),
      user: this.userService.toDto(message.user),
      createdAt: message.createdAt,
    };
  }
}
