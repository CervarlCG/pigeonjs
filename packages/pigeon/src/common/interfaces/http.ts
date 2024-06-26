import { Request } from 'express';
import { Channel } from 'src/models/channels/entities/channel.entity';
import { Workspace } from 'src/models/workspace/entities/workspace.entity';

export interface AppRequest extends Request {
  user?: { id: number; email: string };
  workspace?: Workspace;
}

export interface UserRequest extends Request {
  user: { id: number; email: string };
}
