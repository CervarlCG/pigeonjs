import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { MessagesService } from './message.service';
import { ChannelMemberGuard } from '../channels/channel.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { UserRequest } from 'src/common/interfaces/http';
import { UpdateMessageDto } from './dto/update-message.dto';
import { parseID } from 'src/common/utils/id';
import { MessageOwnerGuard } from './message.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { maxMessagesAttachments } from 'src/config/files';
import { FileType } from 'src/common/types/file';
import { FilesUploadValidationPipe } from 'src/common/validators/file-upload';
import { MessageAttachmentService } from './message-attachments.service';
import { AttachmentViewPermission } from './message-attachment.guard';

@Controller('/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly messageAttachmentService: MessageAttachmentService,
  ) {}

  @Get('/')
  @UseGuards(ChannelMemberGuard)
  async list(@Request() req: UserRequest) {
    const { messages, next } = await this.messagesService.search(
      parseID(req.query.channelId!.toString()),
      req.query.query?.toString().trim(),
      req.query.after?.toString().trim(),
    );

    return {
      messages: messages.map((message) => this.messagesService.toDto(message)),
      next,
    };
  }

  @Get('/attachment/:id')
  @UseGuards(AttachmentViewPermission)
  async downloadAttachment(
    @Res() res: Response,
    @Param() params: { id: string },
    @Query() query: { preview?: boolean },
  ) {
    const { buffer, mimetype } =
      await this.messageAttachmentService.getAttachmentBuffer(
        parseID(params.id),
        query.preview,
      );
    res.setHeader('Content-Type', mimetype);
    res.setHeader('Content-Disposition', 'inline');
    res.send(buffer);
  }

  @Post('/')
  @UseGuards(ChannelMemberGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'attachments',
        maxCount: maxMessagesAttachments,
      },
    ]),
  )
  async create(
    @Request() req: UserRequest,
    @Body() body: CreateMessageDto,
    @UploadedFiles(FilesUploadValidationPipe)
    files: { attachments?: FileType[] },
  ) {
    return {
      message: this.messagesService.toDto(
        await this.messagesService.create(
          {
            message: body.message,
            channelId: req.query.channelId!.toString(),
            attachments: files.attachments,
          },
          req.user.id,
        ),
      ),
    };
  }

  @Patch('/:messageId')
  @UseGuards(MessageOwnerGuard)
  async update(@Param() params: any, @Body() body: UpdateMessageDto) {
    return {
      message: this.messagesService.toDto(
        await this.messagesService.update(
          parseID(params.messageId),
          body.message,
        ),
      ),
    };
  }

  @Delete('/:messageId')
  @UseGuards(MessageOwnerGuard)
  async remove(@Param() params: any) {
    await this.messagesService.remove(parseID(params.messageId));
  }
}
