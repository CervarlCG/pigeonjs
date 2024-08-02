import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { EntityID } from 'src/common/types/id';
import { UserService } from '../user/user.service';
import { ChannelService } from '../channels/channel.service';
import { parseID } from 'src/common/utils/id';
import { ResourceNotFoundException } from 'src/common/exceptions/system';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
  ) {}

  async search() {}

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

  async remove() {}

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
