import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WorkspaceService } from './workspace.service';
import { AppRequest } from 'src/common/interfaces/http';

@Injectable()
export class WorkspaceMiddleware implements NestMiddleware {
  constructor(private readonly workspaceService: WorkspaceService) {}

  async use(req: AppRequest, res: Response, next: NextFunction) {
    const workspaceId = req.params.workspaceId;
    if (workspaceId) {
      const workspace = await this.workspaceService.findById(
        parseInt(workspaceId),
        {
          relations: { users: true, owner: true },
          select: {
            users: { id: true, email: true, role: true },
            owner: { id: true, email: true, role: true },
          },
        },
      );
      req.workspace = workspace || undefined;
    }
    next();
  }
}
