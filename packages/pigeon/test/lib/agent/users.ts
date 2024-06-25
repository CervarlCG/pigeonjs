import {
  getRandomName,
  generateRandomEmail,
  generateRandomValue,
} from 'test/utils/string';
import { UserRoles } from 'pigeon-types';
import { UserService } from 'src/models/user/user.service';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { User } from 'src/models/user/entities/user.entity';
import { AgentException } from './exception';
import { CreateUserDto } from 'src/models/user/dto/create-user.dto';
import { EntityID } from 'src/common/types/id';

export class UserAgent {
  public server: any;
  public me: User;
  public tokens: { accessToken: string; refreshToken: string };
  public password: string;
  public app: INestApplication;

  constructor(app: INestApplication, user: User, password: string) {
    this.app = app;
    this.me = user;
    this.server = app.getHttpServer();
    this.password = password;
  }

  static async create(app: INestApplication, role = UserRoles.TEAM_MATE) {
    const dto = {
      ...getRandomName(),
      email: generateRandomEmail(),
      password: generateRandomValue(),
    };
    const userService = app.get(UserService);
    const user = await userService.create(dto, role);

    return new UserAgent(app, user, dto.password);
  }

  static async signUp(app: INestApplication, dto?: CreateUserDto) {
    const body = dto || {
      ...getRandomName(),
      email: generateRandomEmail(),
      password: generateRandomValue(),
    };
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(body);

    const user = response.body;

    if (!response.ok || !user) throw new AgentException(response);
    return new UserAgent(app, user, body.password);
  }

  async login() {
    const response = await request(this.server).post('/auth/login').send({
      email: this.me.email,
      password: this.password,
    });
    const { user, token } = response.body;

    if (!response.ok || !user || !token) throw new AgentException(response);

    this.me = user;
    this.tokens = token;
  }

  async refreshToken() {
    const response = await this.autenticatedRequest({
      method: 'post',
      url: '/auth/refresh-token',
      body: {
        refreshToken: this.tokens.refreshToken,
      },
    });

    this.tokens = response.body;
  }

  async getInstanceOfMe() {
    const response = await this.autenticatedRequest({ url: '/users/me' });
    return new UserAgent(this.app, response.body, this.password);
  }

  async autenticatedRequest({
    method,
    url,
    body,
    configure,
  }: {
    method?: string;
    url: string;
    body?: any;
    configure?: (request: request.Test) => request.Test;
  }) {
    const client = request(this.server) as any;
    let requestTest = client[method || 'get'](url).set({
      Authorization: `Bearer ${this.tokens.accessToken}`,
      'Content-Type': 'application/json',
    }) as request.Test;

    if (configure) requestTest = configure(requestTest);

    const response = await (body ? requestTest.send(body) : requestTest);

    if (!response.ok) throw new AgentException(response);

    return response;
  }

  static async destroy(app: INestApplication, userId: EntityID) {
    await app.get(UserService).delete(userId, { hardDelete: true });
  }
}
