import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import slugify from 'slugify';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}
  async create(createPostDto: CreatePostDto) {
    const { title, content, author, tags, type, image } = createPostDto;

    const post = await this.prisma.post.create({
      data: {
        slug: await this.createSlug(title),
        title,
        content,
        type,
        author: {
          connect: {
            id: author,
          },
        },
        tags: {
          create: tags.map((el) => ({
            tag: {
              connectOrCreate: {
                where: {
                  name: el,
                },
                create: {
                  name: el,
                },
              },
            },
          })),
        },
        ...(image && {
          article: {
            create: {
              image: { connect: { id: image } },
            },
          },
        }),
      },
    });

    return post;
  }

  async findAll() {
    return await this.prisma.post.findMany({
      include: {
        author: true,
        article: {
          include: { image: true },
        },
        question: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: string) {
    return this.prisma.post.delete({ where: { id } });
  }

  // create slug by title
  async createSlug(title: string) {
    const slug = slugify(title, { lower: true });
    const post = await this.prisma.post.findUnique({ where: { slug } });
    if (post) {
      throw new ConflictException('Slug already exists');
    }
    return slug;
  }
}
