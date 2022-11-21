import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pushNotification: NotificationsService,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    const { author, post, content } = createCommentDto;
    const comment = await this.prisma.postComment.create({
      data: {
        content: content,
        author: {
          connect: {
            id: author,
          },
        },
        post: {
          connect: {
            id: post,
          },
        },
      },
      include: { author: true, post: true },
    });

    // push notification
    this.pushNotification.create({
      from: author,
      to: comment.post.userId,
      target: post,
      type: 'COMMENT',
    });

    return comment;
  }

  findAll() {
    return this.prisma.postComment.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  findPostComment(id: string) {
    return this.prisma.postComment.findMany({
      orderBy: [{ createdAt: 'desc' }],
      where: {
        post: {
          id,
        },
      },
      include: {
        author: { include: { profile: { include: { avatar: true } } } },
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  // update comment
  update(id: string, updateCommentDto: UpdateCommentDto) {
    return this.prisma.postComment.update({
      where: {
        id,
      },
      data: {
        content: updateCommentDto.content,
      },
    });
  }

  //remove comment
  remove(id: string) {
    return this.prisma.postComment.delete({
      where: {
        id,
      },
    });
  }

  // get user comments
  getCommentsByAuthor(authorId: string) {
    return this.prisma.postComment.findMany({
      orderBy: [{ createdAt: 'desc' }],
      where: {
        userId: authorId,
      },
      include: {
        author: {
          include: {
            profile: {
              include: {
                avatar: true,
              },
            },
          },
        },
        post: {
          select: {
            slug: true,
            type: true,
          },
        },
      },
    });
  }
}
