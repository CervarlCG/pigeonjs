import {
  Body,
  Controller,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChannelModerationGuard } from './channel.guard';
import { UserRequest } from 'src/common/interfaces/http';

@Controller('/channels')
@UseGuards(JwtAuthGuard, ChannelModerationGuard)
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Post()
  async create(@Body() body: CreateChannelDto, @Request() req: UserRequest) {
    return {
      channel: this.channelService.toDto(
        await this.channelService.create(body, req.user.id),
      ),
    };
  }
}
