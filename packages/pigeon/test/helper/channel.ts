import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ITestUser } from './user';
import { CreateChannelDto } from '../../src/models/channels/dto/create-channel.dto';
import { Channel } from '../../src/models/channels/entities/channel.entity';

export async function createChannel(
  app: INestApplication,
  user: ITestUser,
  dto: CreateChannelDto,
): Promise<[Channel, request.Response]> {
  const response = await request(app.getHttpServer())
    .post('/channels')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${user.token.accessToken}`)
    .send(dto);

  return [response.body.channel as Channel, response];
}
