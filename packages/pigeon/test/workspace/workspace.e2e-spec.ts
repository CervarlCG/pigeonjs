import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { UserRoles } from 'pigeon-types';
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

  it('Should check permissions to allow only admins create workspaces', async () => {
    const admin = users[1];
    const moderator = users[0];
    const teammate = users[2];

    const workspace1: AgentException = await teammate.workspace
      .create()
      .catch((err) => err);
    const workspace2: AgentException = await moderator.workspace
      .create()
      .catch((err) => err);
    const [workspace3, workspace3Response] = await admin.workspace.create();

    expect(workspace1).toBeInstanceOf(AgentException);
    expect(workspace1.statusCode).toBe(401);
    expect(workspace2).toBeInstanceOf(AgentException);
    expect(workspace2.statusCode).toBe(401);
    expect(workspace3Response.statusCode).toBe(201);

    await AgentEntity.destroy(app, { workspaces: [workspace3] });
  });

  it('Should return all workspace where user is member', async () => {
    const admin = users[1];
    const teammate = users[2];

    const [workspace1] = await admin.workspace.create();
    const [workspace2] = await admin.workspace.create();
    const [workspace3] = await admin.workspace.create();
    await Promise.all([
      admin.workspace.addUser(workspace1.id, teammate.user.me.id),
      admin.workspace.addUser(workspace3.id, teammate.user.me.id),
    ]);
    const [workspaces] = await teammate.workspace.list();

    expect(workspaces.length).toBe(2);
    expect(workspaces.find((w) => w.id === workspace1.id)?.id).toBeDefined();
    expect(workspaces.find((w) => w.id === workspace2.id)?.id).toBeUndefined();
    expect(workspaces.find((w) => w.id === workspace3.id)?.id).toBeDefined();

    await AgentEntity.destroy(app, {
      workspaces: [workspace1, workspace2, workspace3],
    });
  });

  it('Should return workspace if user is member', async () => {
    const admin = users[1];
    const moderator = users[0];
    const teammate = users[2];

    const [workspace1] = await admin.workspace.create();
    await Promise.all([
      admin.workspace.addUser(workspace1.id, moderator.user.me.id),
      admin.workspace.addUser(workspace1.id, teammate.user.me.id),
    ]);
    const [workspace1V2, workspace1V2Response] = await admin.workspace.get(
      workspace1.id,
    );

    expect(workspace1V2Response.statusCode).toBe(200);
    expect(workspace1V2.id).toBeDefined();

    await AgentEntity.destroy(app, { workspaces: [workspace1V2] });
  });
});
