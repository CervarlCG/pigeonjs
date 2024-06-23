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
  listChannels,
  updateChannel,
} from 'test/helper/channel';
import { ChannelService } from 'src/models/channels/channel.service';
import { Privacy } from 'src/common/constants/private';
import { AgentEntity } from 'test/lib/agent';

describe('WorkspaceController (Create)', () => {
  let app: INestApplication;
  let userService: UserService;
  let workspaceService: WorkspaceService;
  let channelService: ChannelService;
  let authService: AuthService;
  let users: AgentEntity[] = [];

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
    users = await AgentEntity.createBatch(app, [
      UserRoles.MODERATOR,
      UserRoles.ADMIN,
      UserRoles.TEAM_MATE,
      UserRoles.ADMIN,
      UserRoles.TEAM_MATE,
    ]);
  });

  afterAll(async () => {
    await AgentEntity.destroy(app, { agents: users });
    await app.close();
  });

  it('Should check permissions to allow only admins and mods create channels', async () => {
    const admin = users[1];
    const moderator = users[0];
    const teammate = users[2];

    const [workspace1] = await admin.workspace.create();
    await Promise.all([
      admin.workspace.addUser(workspace1.id, moderator.user.me.id),
      admin.workspace.addUser(workspace1.id, teammate.user.me.id),
    ]);

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
      workspaceId: workspace1.id.toString(),
    });

    expect(channel1Response.statusCode).toBe(201);
    expect(channel1.name).toBe(channel1Name);
    expect(channel1.handle).toBe(channel1Name);

    const [channel2, channel2Response] = await createChannel(app, mod, {
      name: channel2Name,
      workspaceId: workspace1.id.toString(),
    });

    expect(channel2Response.statusCode).toBe(201);
    expect(channel2.name).toBe(channel2Name);
    expect(channel2.handle).toBe(channel2Name);

    const [_, channel3Response] = await createChannel(app, user, {
      name: channel3Name,
      workspaceId: workspace1.id.toString(),
    });

    expect(channel3Response.statusCode).toBe(403);

    await Promise.all([
      await channelService.remove(channel1.id, { soft: false }),
      await channelService.remove(channel2.id, { soft: false }),
    ]);

    await workspaceService.delete(workspace1.id, false);
  });

  it('Should list channels where users is member', async () => {
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

    const [channelListForUser1] = await listChannels(
      app,
      user1,
      workspace1.id.toString(),
    );

    const [channelListForUser2] = await listChannels(
      app,
      user2,
      workspace1.id.toString(),
    );

    expect(channelListForUser1.channels.length).toBe(3);
    expect(channelListForUser2.channels.length).toBe(2);
    expect(
      channelListForUser2.channels.find(
        (chaneel) => chaneel.id === channel2.id,
      ),
    ).toBeUndefined();

    await Promise.all([
      await channelService.remove(channel1.id, { soft: false }),
      await channelService.remove(channel2.id, { soft: false }),
      await channelService.remove(channel3.id, { soft: false }),
    ]);

    await workspaceService.delete(workspace1.id, false);
  });

  it('Should allow update channel', async () => {
    const admin = users[1];
    const user = users[2];
    const channelName = generateRandomValue(20, 'e2e-channel-');
    const [workspace1] = await createWorkspace(app, admin);

    const [channel1] = await createChannel(app, admin, {
      workspaceId: workspace1.id.toString(),
    });

    await addUserToWorkspace(
      app,
      admin,
      workspace1.id.toString(),
      user.user.id.toString(),
    );

    expect(channel1.privacy).toBe(Privacy.PRIVATE);

    const [channel1V2] = await updateChannel(app, admin, {
      channelId: channel1.id.toString(),
      name: channelName,
      privacy: Privacy.PUBLIC,
    });

    expect(channel1V2.name).toBe(channelName);
    expect(channel1V2.privacy).toBe(Privacy.PUBLIC);

    const [_, channel1V3Response] = await updateChannel(app, user, {
      channelId: channel1.id.toString(),
      name: channelName,
      privacy: Privacy.PRIVATE,
    });

    expect(channel1V3Response.statusCode).toBe(403);

    await Promise.all([
      await channelService.remove(channel1.id, { soft: false }),
    ]);

    await workspaceService.delete(workspace1.id, false);
  });
});
