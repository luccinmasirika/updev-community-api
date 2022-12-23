import { Injectable } from '@nestjs/common';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
  ) {}
  async create(createNotificationDto: CreateNotificationDto) {
    const { from, to, type, target } = createNotificationDto;

    const receiver = await this.prisma.user.findFirst({ where: { id: to } });
    const sender = await this.prisma.user.findFirst({ where: { id: from } });
    const post = await this.prisma.post.findFirst({
      where: { id: target },
      include: { article: { include: { image: true } } },
    });

    if (from === to) {
      return;
    }

    this.mailerService.sendMail({
      to: receiver.email,
      from: 'Updev Community <info@updevcommunity.com>',
      subject: `${sender.firstName} ${sender.lastName} ${
        type !== 'COMMENT'
          ? 'a réagi à votre publication'
          : 'a commenté votre publication'
      } `,
      template: 'notification',
      context: {
        sender: `${sender?.firstName} ${sender?.lastName}`,
        image: `${post.type === 'ARTICLE'} ? ${
          post?.article?.image?.url
        } : '/favicon.com'`,
        title: post?.title,
        reaction: `${sender?.firstName} ${sender?.lastName} ${
          type !== 'COMMENT'
            ? 'a réagi à votre publication'
            : 'a commenté votre publication'
        } `,
      },
    });

    return await this.prisma.notification.create({
      data: {
        type,
        notificationFromUser: {
          connect: {
            id: from,
          },
        },
        notificationToUser: {
          connect: {
            id: to,
          },
        },
        post: {
          connect: {
            id: target,
          },
        },
      },
    });
  }

  async findAll(toUserId: string) {
    const notifications = await this.prisma.notification.findMany({
      orderBy: [{ createdAt: 'desc' }],
      where: {
        notificationToUser: {
          id: toUserId,
        },
      },
      include: {
        comment: {
          include: {
            post: {
              select: {
                slug: true,
                title: true,
                type: true,
              },
            },
          },
        },
        post: {
          select: {
            slug: true,
            title: true,
            type: true,
          },
        },
        notificationFromUser: {
          include: {
            profile: {
              include: {
                avatar: true,
              },
            },
          },
        },
        notificationToUser: {
          include: {
            profile: {
              include: {
                avatar: true,
              },
            },
          },
        },
      },
    });

    const acc = notifications.reduce((acc, notification) => {
      const date = new Date(notification.createdAt).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(notification);
      return acc;
    }, {});

    const groups = Object.keys(acc).map((date) => {
      return {
        date,
        notifications: acc[date],
      };
    });

    return groups;
  }

  async getNotificationsCount(toUserId: string) {
    return await this.prisma.notification.count({
      where: {
        notificationToUser: {
          id: toUserId,
        },
        read: false,
      },
    });
  }

  async readNotification(id: string) {
    return await this.prisma.notification.update({
      where: { id },
      data: {
        read: true,
      },
    });
  }

  async readAllNotification(userId: string) {
    return await this.prisma.notification.updateMany({
      where: { notificationToUser: { id: userId } },
      data: {
        read: true,
      },
    });
  }
}
