import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}
  create(createTagDto: CreateTagDto) {
    return this.prisma.tags.create({ data: { name: createTagDto.name } });
  }

  async findAll(name: string) {
    return await this.prisma.tags.findMany({
      where: { ...(name && { name: { contains: name } }) },
      orderBy: [
        {
          posts: { _count: 'desc' },
        },
      ],
      include: { _count: true },
    });
  }

  async followTag(tagName: string, userId: string) {
    const follow = await this.prisma.followTags.findUnique({
      where: {
        userId_tagName: {
          userId,
          tagName,
        },
      },
    });

    if (follow) {
      return this.prisma.followTags.delete({
        where: {
          id: follow.id,
        },
      });
    } else {
      return this.prisma.followTags.create({
        data: {
          tagName,
          userId,
        },
      });
    }
  }

  async getFollowedTags(userId: string) {
    return await this.prisma.followTags.findMany({
      where: {
        userId,
      },
      select: {
        tag: { select: { name: true, _count: { select: { posts: true } } } },
      },
    });
  }
}
