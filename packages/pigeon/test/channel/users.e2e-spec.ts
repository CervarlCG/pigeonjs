import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { WorkspaceService } from 'src/models/workspace/workspace.service';
import { UserService } from 'src/models/user/user.service';
import { UserRoles } from 'pigeon-types';
import { AuthService } from 'src/models/auth/auth.service';
import { ChannelService } from 'src/models/channels/channel.service';
import { AgentEntity } from 'test/lib/agent';

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

  it('Should add users to channel', async () => {
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
    const [[channel1V2], [channel2V2], [channel3V2]] = await Promise.all([
      admin.channel.get(channel1.id),
      admin.channel.get(channel2.id),
      admin.channel.get(channel3.id),
    ]);
    const channel1Users = channel1V2.users.map((u) => u.id);
    const channel2Users = channel2V2.users.map((u) => u.id);
    const channel3Users = channel3V2.users.map((u) => u.id);

    expect(channel1V2.users.length).toBe(3);
    expect(channel2V2.users.length).toBe(2);
    expect(channel3V2.users.length).toBe(3);
    expect([
      channel1Users.includes(admin.user.me.id),
      channel1Users.includes(teammate.user.me.id),
      channel1Users.includes(teammate.user.me.id),
    ]).toEqual([true, true, true]);
    expect([
      channel2Users.includes(admin.user.me.id),
      channel2Users.includes(teammate.user.me.id),
      channel2Users.includes(teammate2.user.me.id),
    ]).toEqual([true, true, false]);
    expect([
      channel3Users.includes(admin.user.me.id),
      channel3Users.includes(teammate.user.me.id),
      channel3Users.includes(teammate2.user.me.id),
    ]).toEqual([true, true, true]);

    await AgentEntity.destroy(app, {
      channels: [channel1, channel2, channel3],
      workspaces: [workspace1],
    });
  });
});
