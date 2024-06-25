import { UserRoles } from 'pigeon-types';
import { UserAgent } from './users';
import { INestApplication } from '@nestjs/common';
import { WorkspaceAgent } from './workspace';
import { Workspace } from 'src/models/workspace/entities/workspace.entity';
import { ChannelAgent } from './channel';
import { Channel } from 'src/models/channels/entities/channel.entity';

export class AgentEntity {
  public readonly user: UserAgent;
  public readonly workspace: WorkspaceAgent;
  public readonly channel: ChannelAgent;

  constructor(user: UserAgent) {
    this.user = user;
    this.workspace = new WorkspaceAgent(this.user);
    this.channel = new ChannelAgent(this.user);
  }

  static async createBatch(
    app: INestApplication,
    roles: UserRoles[],
    options: { login?: boolean } = {},
  ) {
    const agents = await Promise.all(
      roles.map((role) => UserAgent.create(app, role)),
    );

    if (options.login !== false)
      await Promise.all(agents.map((agent) => agent.login()));

    return agents.map((agent) => new AgentEntity(agent));
  }

  static async destroy(
    app: INestApplication,
    {
      agents,
      workspaces,
      channels,
    }: {
      agents?: AgentEntity[];
      workspaces?: Workspace[];
      channels?: Channel[];
    },
  ) {
    await Promise.all(
      (channels || []).map((channel) => ChannelAgent.destroy(app, channel.id)),
    );
    await Promise.all(
      (workspaces || []).map((workspace) =>
        WorkspaceAgent.destroy(app, workspace.id),
      ),
    );
    await Promise.all(
      (agents || []).map((agent) => UserAgent.destroy(app, agent.user.me.id)),
    );
  }
}
