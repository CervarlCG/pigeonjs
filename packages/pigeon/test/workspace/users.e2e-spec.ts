import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { WorkspaceService } from 'src/models/workspace/workspace.service';
import { UserService } from 'src/models/user/user.service';
import { ITestUser, signUpAccounts } from '../helper/user';
import { UserRoles } from 'pigeon-types';
import { AuthService } from 'src/models/auth/auth.service';
import {
  addUserToWorkspace,
  createWorkspace,
  getWorkspace,
  removeUserFromWorkspace,
} from '../helper/workspace';

describe('WorkspaceController - Users (e2e)', () => {
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

  it('Should allow add users to workspace', async () => {
    const adminUser = users[1];
    const moderatorUser = users[0];
    const teammateUser = users[2];
    const [workspace1V1] = await createWorkspace(app, adminUser);

    const [[_, workspace1V2Response], [__, workspace1V3Response]] =
      await Promise.all([
        addUserToWorkspace(
          app,
          adminUser,
          workspace1V1.id.toString(),
          moderatorUser.user.id.toString(),
        ),
        addUserToWorkspace(
          app,
          moderatorUser,
          workspace1V1.id.toString(),
          teammateUser.user.id.toString(),
        ),
      ]);

    expect(workspace1V2Response.statusCode).toBe(201);
    expect(workspace1V3Response.statusCode).toBe(201);

    const [workspace1V4] = await getWorkspace(
      app,
      adminUser,
      workspace1V1.id.toString(),
    );

    expect(
      workspace1V4.users.find((u: any) => u.id === moderatorUser.user.id),
    ).toBeDefined();
    expect(
      workspace1V4.users.find((u: any) => u.id === teammateUser.user.id),
    ).toBeDefined();

    await workspaceService.delete(workspace1V1.id, false);
  });

  it('Should not allow add users to workspace if logged in user is not on the workspace', async () => {
    const adminUser = users[1];
    const moderatorUser = users[0];
    const teammateUser = users[2];
    const [workspace1V1] = await createWorkspace(app, adminUser);

    const [_, workspace1V2Response] = await addUserToWorkspace(
      app,
      moderatorUser,
      workspace1V1.id.toString(),
      teammateUser.user.id.toString(),
    );

    expect(workspace1V2Response.statusCode).toBe(403);
    await workspaceService.delete(workspace1V1.id, false);
  });

  it('Should not allow add users to workspace if logged in user is teammate', async () => {
    const adminUser = users[1];
    const teammateUser = users[2];
    const teammateUser2 = users[4];
    const [workspace1V1] = await createWorkspace(app, adminUser);

    const [_, workspace1V2Response] = await addUserToWorkspace(
      app,
      adminUser,
      workspace1V1.id.toString(),
      teammateUser.user.id.toString(),
    );

    expect(workspace1V2Response.statusCode).toBe(201);

    const [__, workspace1V3Response] = await addUserToWorkspace(
      app,
      teammateUser,
      workspace1V1.id.toString(),
      teammateUser2.user.id.toString(),
    );
    expect(workspace1V3Response.statusCode).toBe(403);

    await workspaceService.delete(workspace1V1.id, false);
  });

  it('Should allow remove users and check permissions', async () => {
    const adminUser = users[1];
    const moderatorUser = users[0];
    const teammateUser = users[2];
    const teammateUser2 = users[4];

    const [workspace1V1] = await createWorkspace(app, adminUser);
    await addUserToWorkspace(
      app,
      adminUser,
      workspace1V1.id.toString(),
      teammateUser.user.id.toString(),
    );
    await addUserToWorkspace(
      app,
      adminUser,
      workspace1V1.id.toString(),
      teammateUser2.user.id.toString(),
    );

    const removeUserByAdminResponse = await removeUserFromWorkspace(
      app,
      teammateUser,
      workspace1V1.id.toString(),
      teammateUser2.user.id.toString(),
    );
    expect(removeUserByAdminResponse.statusCode).toBe(403);

    const removeOwnerByOwnerResponse = await removeUserFromWorkspace(
      app,
      adminUser,
      workspace1V1.id.toString(),
      adminUser.user.id.toString(),
    );
    expect(removeOwnerByOwnerResponse.statusCode).toBe(409);

    const removeUserByModeratorResponse = await removeUserFromWorkspace(
      app,
      moderatorUser,
      workspace1V1.id.toString(),
      teammateUser2.user.id.toString(),
    );

    expect(removeUserByModeratorResponse.statusCode).toBe(403);

    await workspaceService.delete(workspace1V1.id, false);
  });
});
