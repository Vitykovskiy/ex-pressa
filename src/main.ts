import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export const WEB_APP_URL = process.env.WEB_APP_URL ?? 'http://localhost:3000';
console.log(WEB_APP_URL);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: WEB_APP_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: false,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
