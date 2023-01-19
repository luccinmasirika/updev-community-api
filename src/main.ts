import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
    }),
  );
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://updevcommunity.com',
      'https://www.updevcommunity.com',
      'https://updevcommunity.com:3017',
      'https://www.updevcommunity.com:3017',
      'https://updev-community.vercel.app',
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1');
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/assets' });
  app.useStaticAssets(join(__dirname, '..', 'assets'));

  const config = new DocumentBuilder()
    .setTitle('Nestjs API Documentation')
    .setDescription('Nestjs API Documentation using Swagger')
    .setVersion('1.0.0')
    .addTag('Auth')
    .addTag('Users')
    .addTag('Tags')
    .addTag('Posts')
    .addTag('Mailer')
    .addTag('Files')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(process.env.PORT || 9000);
}
bootstrap();
