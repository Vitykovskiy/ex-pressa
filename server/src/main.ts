import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const webAppUrl = configService.get<string>('WEB_APP_URL', 'http://localhost:5173');

  const config = new DocumentBuilder()
    .setTitle('Ex-Pressa API')
    .setDescription('REST API for menu browsing and cart operations')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableCors({
    origin: webAppUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: false,
  });

  const port = Number(configService.get('PORT', 3000));
  await app.listen(port);
}
void bootstrap();
