import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { generateRandomValue } from 'test/utils/auth';
import { ITestUser } from './user';
import { Workspace } from '../../src/models/workspace/entities/workspace.entity';

export async function createWorkspace(
  app: INestApplication,
  user: ITestUser,
): Promise<[Workspace, request.Response]> {
  const workspaceDto = generateRandomValue(50);
  const response = await request(app.getHttpServer())
    .post('/workspaces')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${user.token.accessToken}`)
    .send({
      name: workspaceDto,
      handle: workspaceDto,
    });

  return [response.body.workspace as Workspace, response];
}

export async function getWorkspace(
  app: INestApplication,
  user: ITestUser,
  workspaceId: string,
): Promise<[Workspace, request.Response]> {
  const response = await request(app.getHttpServer())
    .get('/workspaces/' + workspaceId)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${user.token.accessToken}`)
    .send();

  return [response.body.workspace as Workspace, response];
}

export async function listWorkspaces(
  app: INestApplication,
  user: ITestUser,
): Promise<[Workspace[], request.Response]> {
  const response = await request(app.getHttpServer())
    .get('/workspaces')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${user.token.accessToken}`)
    .send();

  return [response.body.workspaces as Workspace[], response];
}

export async function addUserToWorkspace(
  app: INestApplication,
  user: ITestUser,
  workspaceId: string,
  userId: string,
): Promise<[Workspace, request.Response]> {
  const response = await request(app.getHttpServer())
    .post(`/workspaces/${workspaceId}/user`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${user.token.accessToken}`)
    .send({
      userId: userId,
    });

  return [response.body.workspace as Workspace, response];
}

export async function removeUserFromWorkspace(
  app: INestApplication,
  user: ITestUser,
  workspaceId: string,
  userId: string,
): Promise<request.Response> {
  const response = await request(app.getHttpServer())
    .delete(`/workspaces/${workspaceId}/user`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${user.token.accessToken}`)
    .send({
      userId: userId,
    });

  return response;
}
