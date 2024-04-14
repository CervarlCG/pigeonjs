import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WorkspaceService } from './workspace.service';
import { AppRequest } from 'src/common/interfaces/http';
import { UserService } from '../user/user.service';

@Injectable()
export class WorkspaceMiddleware implements NestMiddleware {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly userService: UserService,
  ) {}

  async use(req: AppRequest, res: Response, next: NextFunction) {
    const workspaceId = req.params.workspaceId;
    if (workspaceId) {
      const workspace = await this.workspaceService.findById(
        parseInt(workspaceId),
        {
          relations: { users: true, owner: true },
          select: {
            users: this.userService.getRelationColums(),
            owner: this.userService.getRelationColums(),
          },
        },
      );
      req.workspace = workspace || undefined;
    }
    next();
  }
}
