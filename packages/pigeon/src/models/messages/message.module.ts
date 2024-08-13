import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from '../pagination/pagination.service';
import { Channel } from '../channels/entities/channel.entity';
import { ChannelService } from '../channels/channel.service';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { Message } from './entities/message.entity';
import { MessagesController } from './message.controller';
import { MessagesService } from './message.service';
import { WorkspaceService } from '../workspace/workspace.service';
import { Workspace } from '../workspace/entities/workspace.entity';
import { MessageAttachment } from './entities/attachment';
import { MulterModule } from '@nestjs/platform-express';
import { MessageAttachmentService } from './message-attachments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      MessageAttachment,
      Channel,
      User,
      Workspace,
    ]),
    MulterModule.register({ dest: './uploads/messages/files' }),
  ],
  providers: [
    ChannelService,
    PaginationService,
    UserService,
    MessagesService,
    MessageAttachmentService,
    WorkspaceService,
  ],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessageModule {}
