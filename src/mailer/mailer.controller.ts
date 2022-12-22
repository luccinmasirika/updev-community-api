import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MailerService } from './mailer.service';

@ApiTags('Mailer')
@Controller('mailer')
export class MailerController {
  constructor(private mailerService: MailerService) {}
  @Get(':receiver')
  sendMail(@Param('receiver') receiver: string) {
    this.mailerService.sendMail({
      to: receiver,
      from: 'Updev Community <info@updevcommunity.com>',
      subject: 'Luccin Masirika liked your comment',
      text: 'Email sent successfully ✔',
      template: 'index',
      context: {
        baseUrl: 'https://api.updevcommunity.com',
      },
    });
  }
}
