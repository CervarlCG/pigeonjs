import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfiguration } from './config/app';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  await app.listen(appConfiguration().port);
}
bootstrap();
