import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Thêm Global ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Cấu hình CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : true,
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`🚀 Server is running at http://localhost:${port}`);
}
bootstrap();
