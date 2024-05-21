import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { WorkspaceService } from 'src/models/workspace/workspace.service';
import { UserService } from 'src/models/user/user.service';
import { ITestUser, signUpAccounts } from '../helper/user';
import { UserRoles } from 'pigeon-types';
import { AuthService } from 'src/models/auth/auth.service';
import { generateRandomValue } from '../utils/auth';
import { addUserToWorkspace, createWorkspace } from '../helper/workspace';
import {
  addUserToChannel,
  createChannel,
  getChannel,
  listChannels,
} from 'test/helper/channel';
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

  it('Should add users to channel', async () => {
    const admin = users[1];
    const user1 = users[2];
    const user2 = users[4];

    const [workspace1] = await createWorkspace(app, admin);
    await addUserToWorkspace(
      app,
      admin,
      workspace1.id.toString(),
      user1.user.id.toString(),
    );
    await addUserToWorkspace(
      app,
      admin,
      workspace1.id.toString(),
      user2.user.id.toString(),
    );

    const [[channel1], [channel2], [channel3]] = await Promise.all([
      createChannel(app, admin, {
        workspaceId: workspace1.id.toString(),
      }),
      createChannel(app, admin, {
        workspaceId: workspace1.id.toString(),
      }),
      createChannel(app, admin, {
        workspaceId: workspace1.id.toString(),
      }),
    ]);

    await Promise.all([
      addUserToChannel(app, admin, channel1.id.toString(), user1),
      addUserToChannel(app, admin, channel2.id.toString(), user1),
      addUserToChannel(app, admin, channel3.id.toString(), user1),
      addUserToChannel(app, admin, channel1.id.toString(), user2),
      addUserToChannel(app, admin, channel3.id.toString(), user2),
    ]);

    const [[channel1V2], [channel2V2], [channel3V2]] = await Promise.all([
      getChannel(app, admin, channel1.id.toString()),
      getChannel(app, admin, channel2.id.toString()),
      getChannel(app, admin, channel3.id.toString()),
    ]);

    expect(channel1V2.users.length).toBe(3);
    expect(channel2V2.users.length).toBe(2);
    expect(channel3V2.users.length).toBe(3);

    const channel1Users = channel1V2.users.map((u) => u.id);
    const channel2Users = channel2V2.users.map((u) => u.id);
    const channel3Users = channel3V2.users.map((u) => u.id);

    expect([
      channel1Users.includes(admin.user.id),
      channel1Users.includes(user1.user.id),
      channel1Users.includes(user2.user.id),
    ]).toEqual([true, true, true]);

    expect([
      channel2Users.includes(admin.user.id),
      channel2Users.includes(user1.user.id),
      channel2Users.includes(user2.user.id),
    ]).toEqual([true, true, false]);

    expect([
      channel3Users.includes(admin.user.id),
      channel3Users.includes(user1.user.id),
      channel3Users.includes(user2.user.id),
    ]).toEqual([true, true, true]);

    await Promise.all([
      await channelService.remove(channel1.id, { soft: false }),
      await channelService.remove(channel2.id, { soft: false }),
      await channelService.remove(channel3.id, { soft: false }),
    ]);

    await workspaceService.delete(workspace1.id, false);
  });
});
