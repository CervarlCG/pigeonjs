import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AppRequest } from 'src/common/interfaces/http';
import { UserRoles } from 'pigeon-types';
import { WorkspaceService } from './workspace.service';
import { parseID } from 'src/common/utils/id';

@Injectable()
export class WorkspaceAdministrationGuard implements CanActivate {
  roles = [UserRoles.ADMIN];
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<AppRequest>();

    if (!request.workspace || !request.user) return false;

    const user = request.workspace.users.find((u) => u.id === request.user!.id);

    if (!user || !this.roles.includes(user.role as UserRoles)) return false;

    return true;
  }
}

export class WorkspaceModerationGuard extends WorkspaceAdministrationGuard {
  roles: UserRoles[] = [UserRoles.MODERATOR, UserRoles.ADMIN];
}

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(private workspaceService: WorkspaceService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AppRequest>();
    const workspaceId = request.params.workspaceId || request.query.workspaceId;
    if (!workspaceId) return false;

    return await this.workspaceService.hasUser(
      parseID(workspaceId.toString()),
      request.user!.id,
    );
  }
}
