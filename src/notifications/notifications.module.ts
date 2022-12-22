import { Global, Module } from '@nestjs/common';
import { MailerModule } from '../mailer/mailer.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Global()
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
  imports: [MailerModule],
})
export class NotificationsModule {}
