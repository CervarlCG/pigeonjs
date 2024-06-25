import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { UserRoles } from 'pigeon-types';
import { generateRandomValue } from '../utils/string';
import { Privacy } from 'src/common/constants/private';
import { AgentEntity } from 'test/lib/agent';
import { AgentException } from 'test/lib/agent/exception';

describe('WorkspaceController (Create)', () => {
  let app: INestApplication;
  let users: AgentEntity[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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
    const channel1Name = generateRandomValue(20, 'e2e-channel-');
    const channel2Name = generateRandomValue(20, 'e2e-channel-');
    const channel3Name = generateRandomValue(20, 'e2e-channel-');

    const [workspace1] = await admin.workspace.create();
    await Promise.all([
      admin.workspace.addUser(workspace1.id, moderator.user.me.id),
      admin.workspace.addUser(workspace1.id, teammate.user.me.id),
    ]);
    const [channel1, channel1Response] = await admin.channel.create({
      workspaceId: workspace1.id,
      name: channel1Name,
    });
    const [channel2, channel2Response] = await moderator.channel.create({
      name: channel2Name,
      workspaceId: workspace1.id,
    });
    const channel3Response: AgentException = await teammate.channel
      .create({
        name: channel3Name,
        workspaceId: workspace1.id,
      })
      .catch((err) => err);

    expect(channel1Response.statusCode).toBe(201);
    expect(channel1.name).toBe(channel1Name);
    expect(channel1.handle).toBe(channel1Name);
    expect(channel2Response.statusCode).toBe(201);
    expect(channel2.name).toBe(channel2Name);
    expect(channel2.handle).toBe(channel2Name);
    expect(channel3Response.statusCode).toBe(403);
    expect(channel3Response).toBeInstanceOf(AgentException);

    await AgentEntity.destroy(app, {
      channels: [channel1, channel2],
      workspaces: [workspace1],
    });
  });

  it('Should list channels where users is member', async () => {
    const admin = users[1];
    const teammate = users[2];
    const teammate2 = users[4];

    const [workspace1] = await admin.workspace.create();
    await Promise.all([
      admin.workspace.addUser(workspace1.id, teammate.user.me.id),
      admin.workspace.addUser(workspace1.id, teammate2.user.me.id),
    ]);
    const [[channel1], [channel2], [channel3]] = await Promise.all([
      admin.channel.create({ workspaceId: workspace1.id }),
      admin.channel.create({ workspaceId: workspace1.id }),
      admin.channel.create({ workspaceId: workspace1.id }),
    ]);
    await Promise.all([
      admin.channel.addUser(channel1.id, teammate.user.me.id),
      admin.channel.addUser(channel2.id, teammate.user.me.id),
      admin.channel.addUser(channel3.id, teammate.user.me.id),
      admin.channel.addUser(channel1.id, teammate2.user.me.id),
      admin.channel.addUser(channel3.id, teammate2.user.me.id),
    ]);
    const [channelListForUser1] = await teammate.channel.list(workspace1.id);
    const [channelListForUser2] = await teammate2.channel.list(workspace1.id);

    expect(channelListForUser1.length).toBe(3);
    expect(channelListForUser2.length).toBe(2);
    expect(
      channelListForUser2.find((chaneel) => chaneel.id === channel2.id),
    ).toBeUndefined();

    await AgentEntity.destroy(app, {
      channels: [channel1, channel2, channel3],
      workspaces: [workspace1],
    });
  });

  it('Should allow update channel only to admins and moderators', async () => {
    const admin = users[1];
    const teammate = users[2];
    const channelName = generateRandomValue(20, 'e2e-channel-');

    const [workspace1] = await admin.workspace.create();
    await admin.workspace.addUser(workspace1.id, teammate.user.me.id);
    const [channel1] = await admin.channel.create({
      workspaceId: workspace1.id,
    });
    await admin.channel.addUser(channel1.id, teammate.user.me.id);

    expect(channel1.privacy).toBe(Privacy.PRIVATE);

    const [channel1V2] = await admin.channel.update({
      channelId: channel1.id,
      name: channelName,
      privacy: Privacy.PUBLIC,
    });

    expect(channel1V2.name).toBe(channelName);
    expect(channel1V2.privacy).toBe(Privacy.PUBLIC);

    const channel1V3Response: AgentException = await teammate.channel
      .update({
        channelId: channel1.id,
        name: channelName,
        privacy: Privacy.PRIVATE,
      })
      .catch((err) => err);

    expect(channel1V3Response.statusCode).toBe(403);
    expect(channel1V3Response).toBeInstanceOf(AgentException);

    await AgentEntity.destroy(app, {
      channels: [channel1],
      workspaces: [workspace1],
    });
  });
});
