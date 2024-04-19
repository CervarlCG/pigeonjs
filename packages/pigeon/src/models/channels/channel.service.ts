import { Injectable } from '@nestjs/common';
import { EntityID } from 'src/common/types/id';
import { Repository } from 'typeorm';
import { Channel } from './entities/channel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateChannelDto } from './dto/create-channel.dto';
import {
  ResourceConflictException,
  ResourceNotFoundException,
} from 'src/common/exceptions/system';
import { WorkspaceService } from '../workspace/workspace.service';
import { Privacy } from 'src/common/constants/private';
import { parseID } from 'src/common/utils/id';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    private workspaceService: WorkspaceService,
    private userService: UserService,
  ) {}

  async findById(id: EntityID) {
    return this.channelRepository.findOne({ where: { id } });
  }

  async findByHandle(handle: string) {
    return this.channelRepository.findOne({ where: { handle } });
  }

  /**
   * Gets a workspace
   * @param workspace The workspace or the workspace id
   * @returns The workspace.
   */
  private async getChannel(channel: EntityID | Channel) {
    if (channel instanceof Channel) return channel;
    return this.findById(channel);
  }

  async create(channelData: CreateChannelDto, userId: EntityID) {
    if (await this.findByHandle(channelData.handle))
      throw new ResourceConflictException(
        'Channel with the given handle already exists',
      );

    const workspace = await this.workspaceService.findById(
      parseID(channelData.workspaceId),
    );
    if (!workspace)
      throw new ResourceNotFoundException("Workspace doesn't exist.");

    const user = await this.userService.findById(userId);
    if (!user) throw new ResourceNotFoundException('User not found.');

    const channel = this.channelRepository.create({
      ...channelData,
      privacy: channelData.isDM ? Privacy.PRIVATE : channelData.privacy,
    });
    channel.workspace = workspace;
    channel.users = [user];

    return this.channelRepository.save(channel);
  }

  async update(data: UpdateChannelDto, channelId: EntityID | Channel) {
    const channel = await this.getChannel(channelId);

    if (!channel) throw new ResourceNotFoundException(`Channel was not found`);

    channel.name = data.name;
    return this.channelRepository.save(channel);
  }

  toDto(channel: Channel) {
    return {
      id: channel.id,
      name: channel.name,
      handle: channel.handle,
      privacy: channel.privacy,
      isDM: channel.isDM,
      workspaceId: channel.workspace.id,
      createdAt: channel.createdAt,
      users: channel.users.map((user) => this.userService.toDto(user)),
    };
  }
}
