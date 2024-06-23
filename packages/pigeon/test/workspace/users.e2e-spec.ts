import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { UserRoles } from 'pigeon-types';
import { AgentEntity } from 'test/lib/agent';
import { AgentException } from 'test/lib/agent/exception';

describe('WorkspaceController - Users (e2e)', () => {
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

  it('Should allow add users to workspace', async () => {
    const admin = users[1];
    const moderator = users[0];
    const teammate = users[2];

    const [workspace1V1] = await admin.workspace.create();
    const [_, workspace1V2Response] = await admin.workspace.addUser(
      workspace1V1.id,
      moderator.user.me.id,
    );
    const [__, workspace1V3Response] = await moderator.workspace.addUser(
      workspace1V1.id,
      teammate.user.me.id,
    );
    const [workspace1V4] = await admin.workspace.get(workspace1V1.id);

    expect(workspace1V2Response.statusCode).toBe(201);
    expect(workspace1V3Response.statusCode).toBe(201);
    expect(
      workspace1V4.users.find((u: any) => u.id === moderator.user.me.id),
    ).toBeDefined();
    expect(
      workspace1V4.users.find((u: any) => u.id === teammate.user.me.id),
    ).toBeDefined();

    await AgentEntity.destroy(app, { workspaces: [workspace1V1] });
  });

  it('Should not allow add users to workspace if logged in user is not on the workspace', async () => {
    const admin = users[1];
    const moderator = users[0];
    const teammate = users[2];

    const [workspace1V1] = await admin.workspace.create();
    const workspace1V2 = await moderator.workspace
      .addUser(workspace1V1.id, teammate.user.me.id)
      .catch((err) => err);

    expect(workspace1V2).toBeInstanceOf(AgentException);
    expect(workspace1V2.response.statusCode).toBe(403);

    await AgentEntity.destroy(app, { workspaces: [workspace1V1] });
  });

  it('Should not allow add users to workspace if logged in user role is teammate', async () => {
    const admin = users[1];
    const teammate = users[2];
    const teammate2 = users[4];

    const [workspace1V1] = await admin.workspace.create();
    const [_, workspace1V2Response] = await admin.workspace.addUser(
      workspace1V1.id,
      teammate.user.me.id,
    );
    const workspace1V3 = await teammate.workspace
      .addUser(workspace1V1.id, teammate2.user.me.id)
      .catch((err) => err);

    expect(workspace1V2Response.statusCode).toBe(201);
    expect(workspace1V3).toBeInstanceOf(AgentException);
    expect(workspace1V3.response.statusCode).toBe(403);

    await AgentEntity.destroy(app, { workspaces: [workspace1V1] });
  });

  it('Should allow remove users only to admins', async () => {
    const admin = users[1];
    const moderator = users[0];
    const teammate = users[2];
    const teammate2 = users[4];

    const [workspace1V1] = await admin.workspace.create();
    await Promise.all([
      admin.workspace.addUser(workspace1V1.id, teammate.user.me.id),
      admin.workspace.addUser(workspace1V1.id, teammate2.user.me.id),
    ]);
    const removeUserByTeammate: AgentException = await teammate.workspace
      .removeUser(workspace1V1.id, teammate2.user.me.id)
      .catch((err) => err);
    const removeOwnerByOwnerResponse: AgentException = await admin.workspace
      .removeUser(workspace1V1.id, admin.user.me.id)
      .catch((err) => err);
    const removeUserByModeratorResponse: AgentException =
      await moderator.workspace
        .removeUser(workspace1V1.id, teammate.user.me.id)
        .catch((err) => err);
    const workspace1V2Respose = await admin.workspace.removeUser(
      workspace1V1.id,
      teammate2.user.me.id,
    );

    expect(removeUserByTeammate).toBeInstanceOf(AgentException);
    expect(removeUserByTeammate.statusCode).toBe(403);
    expect(removeOwnerByOwnerResponse).toBeInstanceOf(AgentException);
    expect(removeOwnerByOwnerResponse.statusCode).toBe(409);
    expect(removeUserByModeratorResponse).toBeInstanceOf(AgentException);
    expect(removeUserByModeratorResponse.statusCode).toBe(403);
    expect(workspace1V2Respose.statusCode).toBe(200);

    await AgentEntity.destroy(app, { workspaces: [workspace1V1] });
  });
});
