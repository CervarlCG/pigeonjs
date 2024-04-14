import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChannelModerationGuard } from './channel.guard';

@Controller('/channels')
@UseGuards(JwtAuthGuard, ChannelModerationGuard)
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Post()
  async create(@Body() body: CreateChannelDto) {
    return {
      channel: this.channelService.toDto(
        await this.channelService.create(body),
      ),
    };
  }
}
