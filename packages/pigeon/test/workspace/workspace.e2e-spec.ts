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

describe('WorkspaceController (Create)', () => {
  let app: INestApplication;
  let userService: UserService;
  let workspaceService: WorkspaceService;
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

  it('Should check permissions to allow only admins create workspaces', async () => {
    let user = users[0];
    const workspace1 = generateRandomValue();
    const responseUser1 = await request(app.getHttpServer())
      .post('/workspaces')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${user.token.accessToken}`)
      .send({
        name: workspace1,
        handle: workspace1,
      });

    expect(responseUser1.statusCode).toBe(401);

    user = users[2];
    const responseUser2 = await request(app.getHttpServer())
      .post('/workspaces')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${user.token.accessToken}`)
      .send({
        name: workspace1,
        handle: workspace1,
      });

    expect(responseUser2.statusCode).toBe(401);

    user = users[1];
    const responseUser3 = await request(app.getHttpServer())
      .post('/workspaces')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${user.token.accessToken}`)
      .send({
        name: workspace1,
        handle: workspace1,
      });

    expect(responseUser3.statusCode).toBe(201);

    await workspaceService.delete(responseUser3.body.workspace.id, false);
  });

  it('Should return all workspace where user is member', async () => {
    const adminUser = users[1];
    const teammateUser = users[2];
    const [workspace1] = await createWorkspace(app, adminUser);
    const [workspace2] = await createWorkspace(app, adminUser);
    const [workspace3] = await createWorkspace(app, adminUser);

    await addUserToWorkspace(
      app,
      adminUser,
      workspace1.id.toString(),
      teammateUser.user.id.toString(),
    );
    await addUserToWorkspace(
      app,
      adminUser,
      workspace3.id.toString(),
      teammateUser.user.id.toString(),
    );

    const [workspaces] = await listWorkspaces(app, teammateUser);

    expect(workspaces.length).toBe(2);
    expect(workspaces.find((w) => w.id === workspace1.id)?.id).toBeDefined();
    expect(workspaces.find((w) => w.id === workspace2.id)?.id).toBeUndefined();
    expect(workspaces.find((w) => w.id === workspace3.id)?.id).toBeDefined();

    await workspaceService.delete(workspace1.id, false);
    await workspaceService.delete(workspace2.id, false);
    await workspaceService.delete(workspace3.id, false);
  });

  it('Should return workspace if user is member', async () => {
    const adminUser = users[1];
    const moderatorUser = users[0];
    const teammateUser = users[2];
    const [workspace1V1] = await createWorkspace(app, adminUser);

    await addUserToWorkspace(
      app,
      adminUser,
      workspace1V1.id.toString(),
      moderatorUser.user.id.toString(),
    );
    await addUserToWorkspace(
      app,
      adminUser,
      workspace1V1.id.toString(),
      teammateUser.user.id.toString(),
    );

    const [workspace1V2, workspace1V2Response] = await getWorkspace(
      app,
      adminUser,
      workspace1V1.id.toString(),
    );
    expect(workspace1V2Response.statusCode).toBe(200);
    expect(workspace1V2.id).toBeDefined();
    await workspaceService.delete(workspace1V1.id, false);
  });
});
