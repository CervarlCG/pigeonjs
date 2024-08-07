import { Module, Scope } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { config } from './config';
import { databaseConfiguration } from './config/database';
import { UserModule } from './models/user/user.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './models/logger/logger.interceptor';
import { LoggerModule } from './models/logger/logger.module';
import { HttpModule } from './models/http/http.module';
import { HttpInterceptor } from './models/http/http.interceptor';
import { RequestModule } from './models/request/request.module';
import { AuthModule } from './models/auth/auth.module';
import { WorkspaceModule } from './models/workspace/workspace.module';
import { PaginationModule } from './models/pagination/pagination.module';
import { ChannelModule } from './models/channels/channel.module';
import { MessageModule } from './models/messages/message.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: config,
    }),
    TypeOrmModule.forRoot(databaseConfiguration()),
    UserModule,
    RequestModule,
    LoggerModule,
    HttpModule,
    PaginationModule,
    AuthModule,
    WorkspaceModule,
    ChannelModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Keep this order for interceptors to avoid problems due to RxJS LIFO execution
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpInterceptor,
      scope: Scope.REQUEST,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
      scope: Scope.REQUEST,
    },
  ],
})
export class AppModule {}
