import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UserRoles } from "pigeon-types";
import { WorkspaceService } from "../workspace/workspace.service";
import { AppRequest } from "src/common/interfaces/http";
import { MessagesService } from "./message.service";
import { parseID } from "src/common/utils/id";

@Injectable()
export class MessageOwnerGuard implements CanActivate {
  constructor(private messagesService: MessagesService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AppRequest>();

    if (!request.params.messageId) return false;

    const message = await this.messagesService.findById(
      parseID(request.params.messageId),
    );

    if( !message || message.user.id !== request.user!.id ) return false;

    return true
  }
}