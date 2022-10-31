import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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
    return await this.prisma.notification.findMany({
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
              },
            },
          },
        },
        post: {
          select: {
            slug: true,
            title: true,
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
  }

  async readNotification(id: string) {
    return await this.prisma.notification.update({
      where: { id },
      data: {
        read: true,
      },
    });
  }
}
