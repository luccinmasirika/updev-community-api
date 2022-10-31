import { ConflictException, Injectable } from '@nestjs/common';
import * as bycrypt from 'bcryptjs';
import { MailerService } from 'src/mailer/mailer.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName } = createUserDto;
    const hashedPassword = await this.hashPassword(password);

    await this.checkIfEmailIsNotUsed(email);

    const confirmationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const user = await this.prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        confirmationCode,
        password: hashedPassword,
        role: 'USER',
      },
    });

    this.mailerService.sendMail({
      to: email,
      from: 'Updev Community <support@updevcommunity.com>',
      subject: 'Your confirmation code',
      template: 'confirmation-code',
      context: {
        title: 'Hi, Your confirmation code is:',
        code: confirmationCode,
        siteLabel: 'Updev community',
        siteLink: '/',
      },
    });

    return user;
  }

  async findOneByEmail(email: string) {
    return await this.prisma.user.findFirst({
      where: { email },
      include: { profile: true },
    });
  }

  async findOneById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async getUsers() {
    return await this.prisma.user.findMany({
      include: { profile: true },
    });
  }

  async hashPassword(pwd: string) {
    return await bycrypt.hash(pwd, 10);
  }

  async activateAccount(code: string) {
    try {
      return await this.prisma.user.update({
        where: { confirmationCode: code },
        data: {
          accountStatus: 'ACTIVE',
          confirmationCode: null,
        },
      });
    } catch (e) {
      throw new ConflictException('Invalid confirmation code');
    }
  }

  async activateUser(id: string) {
    return await this.prisma.user.update({
      where: { id },
      data: {
        accountStatus: 'ACTIVE',
      },
    });
  }

  async disableAccount(id: string) {
    return await this.prisma.user.update({
      where: { id },
      data: {
        accountStatus: 'DISABLED',
      },
    });
  }

  async deleteAccount(id: string) {
    return await this.prisma.user.update({
      where: { id },
      data: {
        accountStatus: 'DELETED',
      },
    });
  }

  async checkIfEmailIsNotUsed(email: string) {
    const isExistingUser = await this.prisma.user.findFirst({
      where: { email, confirmationCode: null },
    });

    if (isExistingUser) {
      throw new ConflictException(
        'Cette adresse mail est déjà utilisée par un autre utilisateur',
      );
    }
  }

  async sendConfirmationEmail(email: string) {}

  async sendResetPasswordEmail(email: string) {}

  async resetPassword(code: string, password: string) {}

  async sendWelcomeEmail(email: string) {}

  async sendGoodbyeEmail(email: string) {}

  async sendPasswordChangedEmail(email: string) {}

  async sendAccountDisabledEmail(email: string) {}

  async sendAccountDeletedEmail(email: string) {}

  async sendAccountEnabledEmail(email: string) {}

  async sendAccountPendingEmail(email: string) {}
}
