import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WorkspaceService } from './workspace.service';
import { AppRequest } from 'src/common/interfaces/http';
import { UserService } from '../user/user.service';
import { parseID } from 'src/common/utils/id';

@Injectable()
export class WorkspaceMiddleware implements NestMiddleware {
  constructor(private readonly workspaceService: WorkspaceService) {}

  async use(req: AppRequest, res: Response, next: NextFunction) {
    const workspaceId = req.params.workspaceId;
    if (workspaceId) {
      const workspace = await this.workspaceService.findById(
        parseID(workspaceId),
      );
      req.workspace = workspace || undefined;
    }
    next();
  }
}
