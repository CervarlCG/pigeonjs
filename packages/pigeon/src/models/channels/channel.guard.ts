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
import { ChannelService } from './channel.service';
import { parseID } from 'src/common/utils/id';

@Injectable()
export class ChannelWorkspaceModerationGuard implements CanActivate {
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

@Injectable()
export class ChannelModerationGuard implements CanActivate {
  roles = [UserRoles.ADMIN, UserRoles.MODERATOR];

  constructor(private channelService: ChannelService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AppRequest>();

    if (!request.params.channelId) return false;

    const channel = await this.channelService.findById(
      parseID(request.params.channelId),
    );

    if (!channel) return false;

    return this.channelService.canModerateChannel(
      channel,
      request.user!.id,
      this.roles,
    );
  }
}
