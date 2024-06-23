import { generateRandomValue } from 'test/helper/user';
import { UserAgent } from './users';
import * as request from 'supertest';
import { EntityID } from 'src/common/types/id';
import { INestApplication } from '@nestjs/common';
import { Channel } from 'src/models/channels/entities/channel.entity';
import { CreateChannelDto } from 'src/models/channels/dto/create-channel.dto';
import { Privacy } from 'src/common/constants/private';
import { ChannelService } from 'src/models/channels/channel.service';
import { UpdateChannelDto } from 'src/models/channels/dto/update-channel.dto';

export class ChannelAgent {
  user: UserAgent;

  constructor(user: UserAgent) {
    this.user = user;
  }

  async get(channelId: EntityID): Promise<[Channel, request.Response]> {
    const response = await this.user.autenticatedRequest({
      url: `/channels/${channelId}`,
    });

    return [response.body.channel as Channel, response];
  }

  async list(workspaceId: EntityID): Promise<[Channel[], request.Response]> {
    const response = await this.user.autenticatedRequest({
      url: `/channels?workspaceId=${workspaceId}`,
    });

    return [response.body.channels as Channel[], response];
  }

  async create(
    channelDto: Partial<Omit<CreateChannelDto, 'workspaceId'>> & {
      workspaceId: EntityID;
    },
  ): Promise<[Channel, request.Response]> {
    const name = channelDto.name || generateRandomValue(20, 'e2e-channel-');
    const handle = channelDto.handle || name;
    const response = await this.user.autenticatedRequest({
      method: 'post',
      url: '/channels',
      body: {
        name,
        handle,
        privacy: channelDto.privacy || Privacy.PRIVATE,
        isDM: channelDto.isDM || false,
        workspaceId: channelDto.workspaceId,
      },
    });
    return [response.body.channel as Channel, response];
  }

  async addUser(
    channelId: EntityID,
    userId: EntityID,
  ): Promise<[Channel, request.Response]> {
    const response = await this.user.autenticatedRequest({
      method: 'post',
      url: `/channels/${channelId}/user`,
      body: { userId },
    });

    return [response.body.channel as Channel, response];
  }

  async update(channelDto: UpdateChannelDto & { channelId: EntityID }) {
    const { channelId, ...body } = channelDto;
    const response = await this.user.autenticatedRequest({
      method: 'post',
      url: `/channels/${channelId}`,
      body,
    });

    return [response.body.channel as Channel, response];
  }

  static async destroy(app: INestApplication, workspaceId: EntityID) {
    await app.get(ChannelService).remove(workspaceId, { soft: false });
  }
}
