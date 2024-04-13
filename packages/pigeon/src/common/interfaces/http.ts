import { Request } from 'express';
import { Workspace } from 'src/models/workspace/entities/workspace.entity';

export interface AppRequest extends Request {
  user?: { id: number; email: string };
  workspace?: Workspace;
}
