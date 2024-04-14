import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from './entities/workspace.entity';
import { UserService } from '../user/user.service';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { User } from '../user/entities/user.entity';
import { WorkspaceMiddleware } from './workspace.middleware';
import { PaginationService } from '../pagination/pagination.service';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, User])],
  providers: [WorkspaceService, UserService, PaginationService],
  controllers: [WorkspaceController],
})
export class WorkspaceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WorkspaceMiddleware).forRoutes(WorkspaceController);
  }
}
