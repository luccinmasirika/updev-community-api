import helmet from '@fastify/helmet';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { contentParser } from 'fastify-multer';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );
  await app.register(helmet, {
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  });
  await app.register(contentParser);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://updevcommunity.com',
      'https://updev-community.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1');
  app.useStaticAssets({
    root: join(__dirname, '..', 'uploads'),
    prefix: '/assets',
  });

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

  await app.listen(process.env.PORT || 9000, '0.0.0.0');
}
bootstrap();
