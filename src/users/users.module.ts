import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '../mailer/mailer.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  imports: [ConfigModule.forRoot({ isGlobal: true }), MailerModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
