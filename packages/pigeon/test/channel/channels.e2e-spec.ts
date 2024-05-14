import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { WorkspaceService } from 'src/models/workspace/workspace.service';
import { UserService } from 'src/models/user/user.service';
import { ITestUser, signUpAccounts } from '../helper/user';
import { UserRoles } from 'pigeon-types';
import { AuthService } from 'src/models/auth/auth.service';
import * as request from 'supertest';
import { generateRandomValue } from '../utils/auth';
import {
  addUserToWorkspace,
  createWorkspace,
  getWorkspace,
  listWorkspaces,
} from '../helper/workspace';
import { createChannel } from 'test/helper/channel';
import { Privacy } from '../../src/common/constants/private';
import { ChannelService } from 'src/models/channels/channel.service';

describe('WorkspaceController (Create)', () => {
  let app: INestApplication;
  let userService: UserService;
  let workspaceService: WorkspaceService;
  let channelService: ChannelService;
  let authService: AuthService;
  let users: ITestUser[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userService = app.get(UserService);
    workspaceService = app.get(WorkspaceService);
    authService = app.get(AuthService);
    channelService = app.get(ChannelService);
    await app.init();
    users = await signUpAccounts(userService, authService, [
      UserRoles.MODERATOR,
      UserRoles.ADMIN,
      UserRoles.TEAM_MATE,
      UserRoles.ADMIN,
      UserRoles.TEAM_MATE,
    ]);
  });

  afterAll(async () => {
    for (const user of users) {
      await userService.delete(user.user.id, { hardDelete: true });
    }
    await app.close();
  });

  it('Should check permissions to allow only admins and mods create channels', async () => {
    const admin = users[1];
    const mod = users[0];
    const user = users[2];
    const channel1Name = generateRandomValue(20, 'e2e-channel-');
    const channel2Name = generateRandomValue(20, 'e2e-channel-');
    const channel3Name = generateRandomValue(20, 'e2e-channel-');

    const [workspace1] = await createWorkspace(app, admin);
    await addUserToWorkspace(
      app,
      admin,
      workspace1.id.toString(),
      mod.user.id.toString(),
    );
    await addUserToWorkspace(
      app,
      admin,
      workspace1.id.toString(),
      user.user.id.toString(),
    );

    const [channel1, channel1Response] = await createChannel(app, admin, {
      name: channel1Name,
      handle: channel1Name,
      privacy: Privacy.PRIVATE,
      workspaceId: workspace1.id.toString(),
      isDM: false,
    });

    expect(channel1Response.statusCode).toBe(201);
    expect(channel1.name).toBe(channel1Name);
    expect(channel1.handle).toBe(channel1Name);

    const [channel2, channel2Response] = await createChannel(app, mod, {
      name: channel2Name,
      handle: channel2Name,
      privacy: Privacy.PRIVATE,
      workspaceId: workspace1.id.toString(),
      isDM: false,
    });

    expect(channel2Response.statusCode).toBe(201);
    expect(channel2.name).toBe(channel2Name);
    expect(channel2.handle).toBe(channel2Name);

    const [_, channel3Response] = await createChannel(app, user, {
      name: channel3Name,
      handle: channel3Name,
      privacy: Privacy.PRIVATE,
      workspaceId: workspace1.id.toString(),
      isDM: false,
    });

    expect(channel3Response.statusCode).toBe(403);

    await Promise.all([
      await channelService.remove(channel1.id, { soft: false }),
      await channelService.remove(channel2.id, { soft: false }),
    ]);

    await workspaceService.delete(workspace1.id, false);
  });
});