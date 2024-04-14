import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppRequest } from 'src/common/interfaces/http';
import { UserRoles } from 'pigeon-types';
import { WorkspaceService } from '../workspace/workspace.service';

@Injectable()
export class ChannelModerationGuard implements CanActivate {
  roles = [UserRoles.ADMIN, UserRoles.MODERATOR];

  constructor(private workspaceService: WorkspaceService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AppRequest>();

    if (!request.body.workspaceId) return false;

    const workspace = await this.workspaceService.findById(
      request.body.workspaceId,
    );

    if (!workspace) return false;

    return await this.workspaceService.canModerateWorkspace(
      workspace,
      request.user!.id,
      this.roles,
    );
  }
}
