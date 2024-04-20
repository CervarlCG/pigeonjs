import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ChannelMemberGuard,
  ChannelModerationGuard,
  ChannelWorkspaceModerationGuard,
} from './channel.guard';
import { UserRequest } from 'src/common/interfaces/http';
import { Channel } from './entities/channel.entity';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { WorkspaceMemberGuard } from '../workspace/workspace.guard';
import { UpdateUserAtChannelDto } from './dto/add-user-to-channel.dto';
import { parseID } from 'src/common/utils/id';

export interface ChannelRequest extends UserRequest {
  channel: Channel;
}

@Controller('/channels')
@UseGuards(JwtAuthGuard)
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Get('/')
  @UseGuards(WorkspaceMemberGuard)
  list(@Request() req: UserRequest) {
    return this.channelService.listByUser(
      req.user.id,
      req.query.after?.toString(),
    );
  }

  @Post()
  @UseGuards(ChannelWorkspaceModerationGuard)
  async create(@Body() body: CreateChannelDto, @Request() req: UserRequest) {
    return {
      channel: this.channelService.toDto(
        await this.channelService.create(body, req.user.id),
      ),
    };
  }

  @Patch('/:channelId')
  @UseGuards(ChannelModerationGuard)
  async update(@Body() body: UpdateChannelDto, @Request() req: ChannelRequest) {
    return {
      channel: this.channelService.toDto(
        await this.channelService.update(body, req.channel),
      ),
    };
  }

  @Delete('/:channelId')
  @UseGuards(ChannelModerationGuard)
  async delete(@Request() req: ChannelRequest) {
    await this.channelService.delete(req.channel.id);
  }

  @Post('/:channelId/user')
  @UseGuards(ChannelMemberGuard)
  async addUser(
    @Request() req: ChannelRequest,
    @Body() body: UpdateUserAtChannelDto,
  ) {
    return {
      channel: this.channelService.toDto(
        await this.channelService.addUser(req.channel, parseID(body.userId)),
      ),
    };
  }
}
