import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import slugify from 'slugify';
import {
  ArticleReactionType,
  NotificationType,
  QuestionReactionType,
} from '@prisma/client';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private readonly pushNotification: NotificationsService,
  ) {}
  async create(createPostDto: CreatePostDto) {
    const { title, content, author, tags, type, image } = createPostDto;

    const slug = await this.createSlug(title);
    const post = await this.prisma.post.create({
      data: {
        slug,
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
        ...(image
          ? {
              article: {
                create: {
                  image: { connect: { id: image } },
                  published: true,
                },
              },
            }
          : {
              question: {
                create: {
                  published: true,
                },
              },
            }),
      },
    });

    return post;
  }

  async findAll() {
    return await this.prisma.post.findMany({
      orderBy: [{ createdAt: 'desc' }],
      include: {
        article: {
          include: { image: true, reactions: { include: { user: true } } },
        },
        author: {
          include: {
            profile: {
              include: {
                avatar: true,
              },
            },
          },
        },
        question: { include: { reactions: { include: { user: true } } } },
        tags: {
          include: {
            tag: true,
          },
        },
        comments: true,
        bookmarks: true,
      },
    });
  }

  async getPostBySlug(slug: string) {
    return await this.prisma.post.findUnique({
      where: { slug },
      include: {
        article: {
          include: { image: true, reactions: { include: { user: true } } },
        },
        author: {
          include: {
            profile: {
              include: {
                avatar: true,
              },
            },
          },
        },
        question: { include: { reactions: { include: { user: true } } } },
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

  async addToBookmarks(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const bookmark = await this.prisma.postBookmark.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (bookmark) {
      await this.prisma.postBookmark.delete({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });
    } else {
      await this.prisma.postBookmark.create({
        data: {
          post: {
            connect: {
              id: postId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
    }

    return await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        article: {
          include: { image: true, reactions: { include: { user: true } } },
        },
        question: { include: { reactions: { include: { user: true } } } },
        author: { include: { profile: { include: { avatar: true } } } },
        comments: true,
        bookmarks: true,
      },
    });
  }

  async getBookmarks(userId: string) {
    return await this.prisma.postBookmark.findMany({
      orderBy: [{ createdAt: 'desc' }],
      where: {
        userId,
      },
      include: {
        post: {
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
            article: {
              include: { image: true, reactions: { include: { user: true } } },
            },
            question: { include: { reactions: { include: { user: true } } } },
            comments: true,
            bookmarks: true,
          },
        },
      },
    });
  }

  async createSlug(title: string) {
    const slug = slugify(title, { lower: true });
    const post = await this.prisma.post.findUnique({ where: { slug } });
    if (!post) {
      return slug;
    }
    return this.createSlug(`${title}-${Math.floor(Math.random() * 9 + 1)}`);
  }

  async getPostsByTag(tag: string) {
    return await this.prisma.post.findMany({
      orderBy: [{ createdAt: 'desc' }],
      where: {
        tags: {
          some: {
            tag: {
              name: tag,
            },
          },
        },
      },
      include: {
        article: {
          include: { image: true, reactions: { include: { user: true } } },
        },
        author: {
          include: {
            profile: {
              include: {
                avatar: true,
              },
            },
          },
        },
        question: { include: { reactions: { include: { user: true } } } },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async getPostsByAuthor(author: string) {
    return await this.prisma.post.findMany({
      orderBy: [{ createdAt: 'desc' }],
      where: {
        author: {
          id: author,
        },
      },
      include: {
        article: {
          include: { image: true, reactions: { include: { user: true } } },
        },
        author: {
          include: {
            profile: {
              include: {
                avatar: true,
              },
            },
          },
        },
        question: { include: { reactions: { include: { user: true } } } },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async getTopPostsOfTheWeek() {
    const postsOfTheWeek = await this.prisma.post.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
        },
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
        article: {
          include: { image: true, reactions: { include: { user: true } } },
        },
        question: { include: { reactions: { include: { user: true } } } },
      },
    });

    const topQuestionsOfTheWeek = postsOfTheWeek
      .filter((post) => post.question)
      .sort((a, b) => b.question.reactions.length - a.question.reactions.length)
      .slice(0, 3);

    const topArticlesOfTheWeek = postsOfTheWeek
      .filter((post) => post.article)
      .sort((a, b) => b.article.reactions.length - a.article.reactions.length)
      .slice(0, 3);

    return { topQuestionsOfTheWeek, topArticlesOfTheWeek };
  }

  async reactToArticlePost(
    postId: string,
    userId: string,
    type: ArticleReactionType,
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        article: {
          include: { image: true, reactions: { include: { user: true } } },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (!post.article) {
      throw new BadRequestException('Post is not an article');
    }

    const reaction = await this.prisma.articleReaction.findUnique({
      where: {
        articleId_userId: {
          articleId: post.article.id,
          userId,
        },
      },
    });

    if (reaction) {
      if (reaction.type === type) {
        await this.prisma.articleReaction.delete({
          where: {
            articleId_userId: {
              articleId: post.article.id,
              userId,
            },
          },
        });
      } else {
        await this.prisma.articleReaction.update({
          where: {
            articleId_userId: {
              articleId: post.article.id,
              userId,
            },
          },
          data: {
            type,
          },
        });
        this.pushNotification.create({
          from: userId,
          to: post.userId,
          target: postId,
          type,
        });
      }
    } else {
      await this.prisma.articleReaction.create({
        data: {
          type,
          user: {
            connect: {
              id: userId,
            },
          },
          article: {
            connect: {
              id: post.article.id,
            },
          },
        },
      });
      this.pushNotification.create({
        from: userId,
        to: post.userId,
        target: postId,
        type,
      });
    }

    return await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        article: {
          include: { image: true, reactions: { include: { user: true } } },
        },
        author: { include: { profile: { include: { avatar: true } } } },
        comments: true,
        bookmarks: true,
      },
    });
  }

  async reactToQuestionPost(
    postId: string,
    userId: string,
    type: QuestionReactionType,
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        question: { include: { reactions: { include: { user: true } } } },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (!post.question) {
      throw new BadRequestException('Is not a post');
    }

    const reaction = await this.prisma.questionReaction.findUnique({
      where: {
        questionId_userId: {
          questionId: post.question?.id,
          userId,
        },
      },
    });

    if (reaction) {
      if (reaction.type === type) {
        await this.prisma.questionReaction.delete({
          where: {
            questionId_userId: {
              questionId: post.question.id,
              userId,
            },
          },
        });
      } else {
        await this.prisma.questionReaction.update({
          where: {
            questionId_userId: {
              questionId: post.question.id,
              userId,
            },
          },
          data: {
            type,
          },
        });

        this.pushNotification.create({
          from: userId,
          to: post.userId,
          target: postId,
          type,
        });
      }
    } else {
      await this.prisma.questionReaction.create({
        data: {
          type,
          user: {
            connect: {
              id: userId,
            },
          },
          question: {
            connect: {
              id: post.question.id,
            },
          },
        },
      });

      this.pushNotification.create({
        from: userId,
        to: post.userId,
        target: postId,
        type,
      });
    }

    return await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        question: { include: { reactions: { include: { user: true } } } },
        author: { include: { profile: { include: { avatar: true } } } },
        comments: true,
        bookmarks: true,
      },
    });
  }

  async getAllReactionsOfPost(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        article: {
          include: { image: true, reactions: { include: { user: true } } },
        },
        question: { include: { reactions: { include: { user: true } } } },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return { reactions: post.article?.reactions || post.question?.reactions };
  }

  // get top authors based on the number of questions and articles reacted they have
  async getTopAuthors() {
    const users = await this.prisma.user.findMany({
      include: {
        profile: {
          include: {
            avatar: true,
          },
        },
        articleReactions: true,
        questionReactions: true,
      },
    });

    const topAuthors = users
      .map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user?.profile?.avatar,
        email: user.email,
        totalReactions:
          user.articleReactions.length +
          user.questionReactions.filter((el) => el.type !== 'DISLIKE').length,
      }))
      .sort((a, b) => b.totalReactions - a.totalReactions)
      .slice(0, 5);

    return topAuthors;
  }

  // push notification
  async pushNotifications(
    from: string,
    to: string,
    target: string,
    type: NotificationType,
  ) {
    if (from === to) {
      return;
    }
    await this.prisma.notification.create({
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
}
