import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './message.service';
import { ChannelMemberGuard } from '../channels/channel.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { UserRequest } from 'src/common/interfaces/http';
import { UpdateMessageDto } from './dto/update-message.dto';
import { parseID } from 'src/common/utils/id';
import { MessageOwnerGuard } from './message.guard';

@Controller('/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('/')
  @UseGuards(ChannelMemberGuard)
  async create(@Request() req: UserRequest, @Body() body: CreateMessageDto) {
    return {
      message: this.messagesService.toDto(
        await this.messagesService.create(body, req.user.id),
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
}
