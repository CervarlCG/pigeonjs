import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ITestUser } from './user';
import { CreateChannelDto } from '../../src/models/channels/dto/create-channel.dto';
import { UpdateChannelDto } from '../../src/models/channels/dto/update-channel.dto';
import { Channel } from '../../src/models/channels/entities/channel.entity';
import { generateRandomValue } from 'test/utils/auth';
import { Privacy } from 'src/common/constants/private';

export async function createChannel(
  app: INestApplication,
  user: ITestUser,
  dto: Partial<CreateChannelDto> & { workspaceId: string },
): Promise<[Channel, request.Response]> {
  const name = dto.name || generateRandomValue(20, 'e2e-channel-');
  const handle = dto.handle || name;
  const response = await request(app.getHttpServer())
    .post('/channels')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${user.token.accessToken}`)
    .send({
      name,
      handle,
      privacy: dto.privacy || Privacy.PRIVATE,
      isDM: dto.isDM || false,
      workspaceId: dto.workspaceId,
    });

  return [response.body.channel as Channel, response];
}

export async function addUserToChannel(
  app: INestApplication,
  user: ITestUser,
  channelId: string,
  userToAdd: ITestUser,
): Promise<[Channel, request.Response]> {
  const response = await request(app.getHttpServer())
    .post(`/channels/${channelId}/user`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${user.token.accessToken}`)
    .send({ userId: userToAdd.user.id });

  return [response.body.channel as Channel, response];
}

export async function listChannels(
  app: INestApplication,
  user: ITestUser,
  workspaceId: string,
): Promise<[{ channels: Channel[]; next: string | null }, request.Response]> {
  const response = await request(app.getHttpServer())
    .get(`/channels?workspaceId=${workspaceId}`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${user.token.accessToken}`)
    .send();

  return [
    response.body as { channels: Channel[]; next: string | null },
    response,
  ];
}

export async function getChannel(
  app: INestApplication,
  user: ITestUser,
  channelId: string,
): Promise<[Channel, request.Response]> {
  const response = await request(app.getHttpServer())
    .get(`/channels/${channelId}`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${user.token.accessToken}`)
    .send();

  return [response.body.channel as Channel, response];
}

export async function updateChannel(
  app: INestApplication,
  user: ITestUser,
  dto: UpdateChannelDto & { channelId: string },
): Promise<[Channel, request.Response]> {
  const { channelId, ...body } = dto;
  const response = await request(app.getHttpServer())
    .patch(`/channels/${dto.channelId}`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${user.token.accessToken}`)
    .send(body);

  return [response.body.channel as Channel, response];
}
