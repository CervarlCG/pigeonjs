import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AppRequest } from 'src/common/interfaces/http';
import { parseID } from 'src/common/utils/id';
import { MessageAttachmentService } from './message-attachments.service';

@Injectable()
export class AttachmentViewPermission implements CanActivate {
  constructor(
    private readonly messageAttachmentService: MessageAttachmentService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AppRequest>();
    const attachmentId = parseID(request.params.id);

    return await this.messageAttachmentService.hasUserPermissionToView(
      attachmentId,
      request.user as any,
    );
  }
}
