import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '../mailer/mailer.module';
import { PostsModule } from '../posts/posts.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  imports: [ConfigModule.forRoot({ isGlobal: true }), MailerModule, PostsModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
