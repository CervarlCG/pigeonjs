import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { config } from './config';
import { databaseConfiguration } from './config/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: config,
    }),
    TypeOrmModule.forRoot(databaseConfiguration())
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
