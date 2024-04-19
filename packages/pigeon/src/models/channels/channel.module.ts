import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from '../pagination/pagination.service';
import { Channel } from './entities/channel.entity';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { WorkspaceService } from '../workspace/workspace.service';
import { Workspace } from '../workspace/entities/workspace.entity';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { ChannelMiddleware } from './channel.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Channel, Workspace, User])],
  providers: [ChannelService, PaginationService, WorkspaceService, UserService],
  controllers: [ChannelController],
  exports: [ChannelService],
})
export class ChannelModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ChannelMiddleware).forRoutes(ChannelController);
  }
}
