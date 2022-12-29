import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ArticleReactionType,
  NotificationType,
  Post,
  PostType,
  QuestionReactionType,
} from '@prisma/client';
import { endOfWeek, getDate, getMonth, startOfWeek } from 'date-fns';
import slugify from 'slugify';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private readonly pushNotification: NotificationsService,
  ) {}
  async create(createPostDto: CreatePostDto) {
    const { title, content, author, tags, type, image, draft } = createPostDto;

    const slug = await this.createSlug(title);
    const postData = {
      slug,
      title,
      content,
      type,
      draft,
      author: { connect: { id: author } },
      tags: {
        create: tags.map((tag) => ({
          tag: {
            connectOrCreate: {
              where: { name: tag },
              create: { name: tag },
            },
          },
        })),
      },
      article: undefined,
      question: undefined,
    };
    if (image) {
      postData.article = {
        create: {
          image: { connect: { id: image } },
          published: true,
        },
      };
    } else {
      postData.question = {
        create: { published: true },
      };
    }

    const post = await this.prisma.post.create({
      data: postData,
    });

    return post;
  }

  async updatePost(id: string, data: UpdatePostDto) {
    const { title, content, tags, image, draft } = data;
    const post = await this.prisma.post.findFirst({
      where: { id },
      include: {
        article: true,
        question: true,
        tags: { include: { tag: true } },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const slug = await this.updateSlug(title, post);
    const updateData = {
      slug,
      title,
      content,
      draft,
      tags: {
        deleteMany: {},
        create: tags.map((tag) => ({
          tag: {
            connectOrCreate: {
              where: { name: tag },
              create: { name: tag },
            },
          },
        })),
      },
      article: undefined,
    };
    if (image) {
      updateData.article = {
        update: { image: { connect: { id: image } } },
      };
    }

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: updateData,
    });

    return updatedPost;
  }

  async findAll(
    page: number,
    perPage: number,
    filters?: {
      type?: PostType;
      tagNames?: string[];
      userId?: string;
      status: string;
      dateRange?: {
        startDate: string;
        endDate: string;
      };
    },
    search?: string,
  ) {
    const pagination = {
      take: perPage,
      skip: (page - 1) * perPage,
    };

    let filter = {
      AND: [
        { draft: filters.status === 'draft' ? true : false },
        filters?.type && { type: filters.type },
        filters?.tagNames &&
          filters.tagNames.length > 0 && {
            tags: { some: { tag: { id: { in: filters.tagNames } } } },
          },
        filters?.userId && { author: { id: filters.userId } },
        filters?.dateRange && {
          createdAt: {
            gte: filters.dateRange.startDate,
            lte: filters.dateRange.endDate,
          },
        },
        search && {
          OR: [
            { title: { contains: search } },
            { content: { contains: search } },
            { tags: { some: { tag: { name: { contains: search } } } } },
          ],
        },
      ],
    };

    const author = {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        profile: { select: { avatar: { select: { url: true } } } },
      },
    };

    const reactions = {
      select: {
        user: author,
        type: true,
      },
    };

    return await this.prisma.post.findMany({
      orderBy: [{ createdAt: 'desc' }],
      ...pagination,
      where: filter,
      include: {
        article: {
          select: {
            image: { select: { url: true } },
            reactions,
          },
        },
        author,
        question: {
          select: {
            reactions,
          },
        },
        tags: { select: { tag: { select: { name: true } } } },
        _count: { select: { comments: true } },
        bookmarks: true,
      },
    });
  }

  async getPostBySlug(slug: string) {
    const author = {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        profile: { select: { avatar: { select: { url: true } } } },
      },
    };

    const reactions = {
      select: {
        user: author,
        type: true,
      },
    };

    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        article: {
          select: { reactions, image: { select: { url: true } } },
        },
        author,
        question: { select: { reactions } },
        tags: {
          select: { tag: { select: { name: true } } },
        },
        bookmarks: true,
        _count: { select: { comments: true } },
      },
    });

    await this.prisma.postViews.create({
      data: {
        post: { connect: { slug } },
        user: { connect: { id: post.author.id } },
      },
    });

    return post;
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
        tags: {
          include: { tag: true },
        },
      },
    });
  }

  async getBookmarks(userId: string, page: number, perPage: number) {
    const pagination = {
      take: perPage,
      skip: (page - 1) * perPage,
    };
    return await this.prisma.postBookmark.findMany({
      orderBy: [{ createdAt: 'desc' }],
      ...pagination,
      where: {
        userId,
      },
      select: {
        post: {
          include: {
            author: {
              include: {
                profile: {
                  select: {
                    avatar: { select: { url: true } },
                  },
                },
              },
            },
            article: {
              select: {
                image: { select: { url: true } },
              },
            },
            question: true,
          },
        },
      },
    });
  }

  async createSlug(title: string) {
    const slug = slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'":@]/g,
    });
    const post = await this.prisma.post.findUnique({ where: { slug } });
    if (!post) {
      return slug;
    }
    return this.createSlug(`${title}-${Math.floor(Math.random() * 9 + 1)}`);
  }

  async updateSlug(title: string, post: Post) {
    const slug = slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'":@]/g,
    });
    if (slug !== post.slug) {
      const post = await this.prisma.post.findUnique({ where: { slug } });
      if (!post) {
        return slug;
      }
      return this.createSlug(`${title}-${Math.floor(Math.random() * 9 + 1)}`);
    }
    return slug;
  }

  async getPostsByTags(tags: string[]) {
    return await this.prisma.post.findMany({
      orderBy: [{ createdAt: 'desc' }],
      where: {
        tags: {
          some: {
            OR: tags.map((el) => ({
              tag: {
                name: el,
              },
            })),
          },
        },
      },

      include: {
        article: {
          include: {
            image: true,
            reactions: {
              include: {
                user: { include: { profile: { include: { avatar: true } } } },
              },
            },
          },
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
        question: {
          include: {
            reactions: {
              include: {
                user: { include: { profile: { include: { avatar: true } } } },
              },
            },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async getPostsSuggestionsByTags(tags: string[], type?: PostType) {
    return await this.prisma.post.findMany({
      orderBy: [{ createdAt: 'desc' }],
      take: 3,
      where: {
        type,
        tags: {
          some: {
            OR: tags.map((el) => ({
              tag: {
                name: el,
              },
            })),
          },
        },
      },

      include: {
        article: {
          include: {
            image: true,
            reactions: {
              include: {
                user: { include: { profile: { include: { avatar: true } } } },
              },
            },
          },
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
        question: {
          include: {
            reactions: {
              include: {
                user: { include: { profile: { include: { avatar: true } } } },
              },
            },
          },
        },
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
          include: {
            image: true,
            reactions: {
              include: {
                user: { include: { profile: { include: { avatar: true } } } },
              },
            },
          },
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
        question: {
          include: {
            reactions: {
              include: {
                user: { include: { profile: { include: { avatar: true } } } },
              },
            },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async getTopPostsOfTheWeek() {
    const year = new Date().getFullYear();
    const month = getMonth(new Date());
    const date = getDate(new Date());
    const start = startOfWeek(new Date(year, month, date), {
      weekStartsOn: 2,
    });
    const end = endOfWeek(new Date(year, month, date), { weekStartsOn: 2 });

    const postsOfTheWeek = await this.prisma.post.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
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

  async getTopPosts() {
    const posts = await this.prisma.post.findMany({
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

    const topPosts = posts
      .map((el) =>
        el.type === 'ARTICLE'
          ? { ...el, reactions: el.article.reactions.length }
          : {
              ...el,
              reactions: el.question.reactions.filter(
                (reaction) => reaction.type !== 'DISLIKE',
              ).length,
            },
      )
      .sort((a, b) => b.reactions - a.reactions);

    return topPosts;
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
        tags: { include: { tag: true } },
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
        tags: { include: { tag: true } },
      },
    });
  }

  async getAllReactionsOfPost(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        article: {
          include: {
            image: true,
            reactions: {
              include: {
                user: { include: { profile: { include: { avatar: true } } } },
              },
            },
          },
        },
        question: {
          include: {
            reactions: {
              include: {
                user: { include: { profile: { include: { avatar: true } } } },
              },
            },
          },
        },
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
