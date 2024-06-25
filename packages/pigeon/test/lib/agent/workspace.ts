import { generateRandomValue } from 'test/utils/string';
import { UserAgent } from './users';
import * as request from 'supertest';
import { Workspace } from '../../../src/models/workspace/entities/workspace.entity';
import { EntityID } from 'src/common/types/id';
import { INestApplication } from '@nestjs/common';
import { WorkspaceService } from 'src/models/workspace/workspace.service';

export class WorkspaceAgent {
  user: UserAgent;

  constructor(user: UserAgent) {
    this.user = user;
  }

  async get(workspaceId: EntityID): Promise<[Workspace, request.Response]> {
    const response = await this.user.autenticatedRequest({
      url: `/workspaces/${workspaceId}`,
    });

    return [response.body.workspace as Workspace, response];
  }

  async list(): Promise<[Workspace[], request.Response]> {
    const response = await this.user.autenticatedRequest({
      url: '/workspaces',
    });

    return [response.body.workspaces as Workspace[], response];
  }

  async create(): Promise<[Workspace, request.Response]> {
    const workspaceDto = generateRandomValue(50);
    const response = await this.user.autenticatedRequest({
      method: 'post',
      url: '/workspaces',
      body: {
        name: workspaceDto,
        handle: workspaceDto,
      },
    });
    return [response.body.workspace as Workspace, response];
  }

  async addUser(
    workspaceId: EntityID,
    userId: EntityID,
  ): Promise<[Workspace, request.Response]> {
    const response = await this.user.autenticatedRequest({
      method: 'post',
      url: `/workspaces/${workspaceId}/user`,
      body: { userId },
    });

    return [response.body.workspace as Workspace, response];
  }

  async removeUser(
    workspaceId: EntityID,
    userId: EntityID,
  ): Promise<request.Response> {
    const response = await this.user.autenticatedRequest({
      method: 'delete',
      url: `/workspaces/${workspaceId}/user`,
      body: { userId },
    });
    return response;
  }

  static async destroy(app: INestApplication, workspaceId: EntityID) {
    await app.get(WorkspaceService).delete(workspaceId, false);
  }
}
