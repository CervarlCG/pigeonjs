import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { UserRequest } from 'src/common/interfaces/http';
import { parseID } from 'src/common/utils/id';
import { ChannelService } from './channel.service';

@Injectable()
export class ChannelMiddleware implements NestMiddleware {
  constructor(private readonly channelService: ChannelService) {}

  async use(req: UserRequest, res: Response, next: NextFunction) {
    const channelId = req.params.channelId;
    if (channelId) {
      const channel = await this.channelService.findById(parseID(channelId));
      (req as any).channel = channel || undefined;
    }
    next();
  }
}
