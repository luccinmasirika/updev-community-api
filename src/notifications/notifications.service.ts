import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}
  async create(createNotificationDto: CreateNotificationDto) {
    const { from, to, type, target } = createNotificationDto;

    if (from === to) {
      return;
    }

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
