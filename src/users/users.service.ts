import { Injectable } from '@nestjs/common';
import { RequestStatus } from '@prisma/client';
import * as bycrypt from 'bcryptjs';
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  getDate,
  getMonth,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';
import { PostsService } from '../posts/posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private postService: PostsService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password, firstName = '', lastName = '' } = createUserDto;
    const hashedPassword = await this.hashPassword(password);

    const username = await this.checkUsername(
      email.split('@')[0].replace(/\s/g, ''),
    );

    const user = await this.prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        username,
        password: hashedPassword,
        role: 'USER',
      },
    });

    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const {
      avatar,
      firstName,
      lastName,
      bio,
      gitHub,
      job,
      linkedIn,
      phone,
      twitter,
    } = updateUserDto;
    return this.prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        profile: {
          upsert: {
            create: {
              ...(avatar && { avatar: { connect: { id: avatar } } }),
              bio,
              gitHub,
              job,
              linkedIn,
              phone,
              twitter,
            },
            update: {
              ...(avatar && { avatar: { connect: { id: avatar } } }),
              bio,
              gitHub,
              job,
              linkedIn,
              phone,
              twitter,
            },
          },
        },
      },
    });
  }

  // update user role
  async updateUserRole(id: string) {
    return await this.prisma.user.update({
      where: { id },
      data: { role: 'AUTHOR' },
    });
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

  async getUserByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: { username },
      include: {
        profile: { include: { avatar: true } },
        posts: {
          orderBy: { createdAt: 'desc' },
          include: { article: { include: { image: true } }, question: true },
        },
        authorRequest: {
          where: {
            user: {
              username,
            },
          },
        },
        followings: {
          select: {
            author: {
              select: {
                username: true,
                firstName: true,
                lastName: true,
                email: true,
                profile: {
                  select: {
                    avatar: {
                      select: {
                        url: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        followers: {
          select: {
            user: {
              select: {
                username: true,
                firstName: true,
                lastName: true,
                email: true,
                profile: {
                  select: {
                    avatar: {
                      select: {
                        url: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async hashPassword(pwd: string) {
    return await bycrypt.hash(pwd, 10);
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

  // check if username exists in database and return username plus a number if it does
  async checkUsername(username: string) {
    const user = await this.prisma.user.findFirst({
      where: { username },
    });

    if (user) {
      const usernameArray = username.split('');
      const lastChar = usernameArray[usernameArray.length - 1];
      if (isNaN(Number(lastChar))) {
        usernameArray.push('1');
      } else {
        const newNumber = Number(lastChar) + 1;
        usernameArray.pop();
        usernameArray.push(newNumber.toString());
      }
      return this.checkUsername(usernameArray.join(''));
    } else {
      return username;
    }
  }

  async updateAllUsernames() {
    const users = await this.prisma.user.findMany();
    return await Promise.all(
      users.map((user) => {
        const username = user.email.split('@')[0].replace(/\s/g, '');
        return this.prisma.user.update({
          where: { id: user.id },
          data: {
            username: username.toLowerCase(),
          },
          select: { email: true, username: true },
        });
      }),
    );
  }

  // get user views from all posts
  async getUserViews(id: string) {
    const posts = await this.prisma.postViews.count({
      where: { userId: id },
    });

    return posts;
  }

  //toggle follow user
  async followUser(userId: string, authorId: string) {
    const follow = await this.prisma.followAuthors.findUnique({
      where: { authorId_userId: { authorId, userId } },
    });

    if (follow) {
      return await this.prisma.followAuthors.delete({
        where: { authorId_userId: { authorId, userId } },
      });
    } else {
      return await this.prisma.followAuthors.create({
        data: {
          user: { connect: { id: userId } },
          author: { connect: { id: authorId } },
        },
      });
    }
  }

  // get all user following
  async getUserFollowings(id: string) {
    return await this.prisma.followAuthors.findMany({
      where: { userId: id },
    });
  }

  // get all user followers
  async getUserFollowers(id: string) {
    return await this.prisma.followAuthors.findMany({
      where: { authorId: id },
    });
  }

  // get weekly user views
  async getDailyViewsForWeek(id: string) {
    const year = new Date().getFullYear();
    const month = getMonth(new Date());
    const date = getDate(new Date());
    const start = startOfWeek(new Date(year, month, date), {
      weekStartsOn: 2,
    });
    const end = endOfWeek(new Date(year, month, date), { weekStartsOn: 2 });
    const days = eachDayOfInterval({ start, end });

    const posts = await this.prisma.postViews.findMany({
      where: {
        userId: id,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const views = days.reduce((acc, day) => {
      const key = day.toISOString().substr(0, 10);
      acc[key] = 0;
      return acc;
    }, {});

    posts.forEach((post) => {
      const date = new Date(post.createdAt);
      const key = date.toISOString().substr(0, 10);
      views[key] += 1;
    });

    return views;
  }

  // get weekly user's posts reactions
  async getDailyReactionsForWeek(id: string) {
    const year = new Date().getFullYear();
    const month = getMonth(new Date());
    const date = getDate(new Date());
    const start = startOfWeek(new Date(year, month, date), {
      weekStartsOn: 2,
    });
    const end = endOfWeek(new Date(year, month, date), { weekStartsOn: 2 });
    const days = eachDayOfInterval({ start, end });

    const posts = await this.prisma.post.findMany({
      where: {
        author: { id },
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        article: {
          include: { reactions: true },
        },
        question: { include: { reactions: true } },
      },

      orderBy: {
        createdAt: 'asc',
      },
    });

    const reactions = days.reduce((acc, day) => {
      const key = day.toISOString().substr(0, 10);
      acc[key] = 0;
      return acc;
    }, {});

    posts.forEach((post) => {
      if (post.article) {
        post.article.reactions.forEach((reaction) => {
          const date = new Date(reaction.createdAt);
          const key = date.toISOString().substr(0, 10);
          reactions[key] += 1;
        });
      } else {
        post.question.reactions.forEach((reaction) => {
          const date = new Date(reaction.createdAt);
          const key = date.toISOString().substr(0, 10);
          reactions[key] += 1;
        });
      }
    });

    return reactions;
  }

  // get monthly user views
  async getDailyViewsForMonth(id: string) {
    const start = subDays(startOfMonth(new Date()), -1);
    const end = subDays(endOfMonth(new Date()), -1);
    const days = eachDayOfInterval({ start, end });

    const posts = await this.prisma.postViews.findMany({
      where: {
        userId: id,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const views = days.reduce((acc, day) => {
      const key = day.toISOString().substr(5, 5);
      acc[key] = 0;
      return acc;
    }, {});

    posts.forEach((post) => {
      const date = new Date(post.createdAt);
      const key = date.toISOString().substr(5, 5);
      views[key] += 1;
    });

    return views;
  }

  // get monthly user's posts reactions
  async getDailyReactionsForMonth(id: string) {
    const start = subDays(startOfMonth(new Date()), -1);
    const end = subDays(endOfMonth(new Date()), -1);
    const days = eachDayOfInterval({ start, end });

    const posts = await this.prisma.post.findMany({
      where: {
        author: { id },
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        article: {
          include: { reactions: true },
        },
        question: { include: { reactions: true } },
      },

      orderBy: {
        createdAt: 'asc',
      },
    });

    const reactions = days.reduce((acc, day) => {
      const key = day.toISOString().substr(5, 5);
      acc[key] = 0;
      return acc;
    }, {});

    posts.forEach((post) => {
      if (post.article) {
        post.article.reactions.forEach((reaction) => {
          const date = new Date(reaction.createdAt);
          const key = date.toISOString().substr(5, 5);
          reactions[key] += 1;
        });
      } else {
        post.question.reactions.forEach((reaction) => {
          const date = new Date(reaction.createdAt);
          const key = date.toISOString().substr(5, 5);
          reactions[key] += 1;
        });
      }
    });

    return reactions;
  }

  // get monthly user views for year
  async getMonthlyViewsForYear(id: string) {
    const start = subMonths(startOfYear(new Date()), -1);
    const end = subMonths(endOfYear(new Date()), -1);
    const months = eachMonthOfInterval({ start, end });

    const posts = await this.prisma.postViews.findMany({
      where: {
        userId: id,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const views = months.reduce((acc, month) => {
      const key = month.toISOString().substr(0, 7);
      acc[key] = 0;
      return acc;
    }, {});

    posts.forEach((post) => {
      const date = new Date(post.createdAt);
      const key = date.toISOString().substr(0, 7);
      views[key] += 1;
    });

    return views;
  }

  // get monthly user's post reactions for year
  async getMonthlyReactionsForYear(id: string) {
    const start = subMonths(startOfYear(new Date()), -1);
    const end = subMonths(endOfYear(new Date()), -1);
    const months = eachMonthOfInterval({ start, end });

    const posts = await this.prisma.post.findMany({
      where: {
        author: { id },
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        article: {
          include: { reactions: true },
        },
        question: { include: { reactions: true } },
      },

      orderBy: {
        createdAt: 'asc',
      },

      take: 100,
    });

    const reactions = months.reduce((acc, month) => {
      const key = month.toISOString().substr(0, 7);
      acc[key] = 0;
      return acc;
    }, {});

    posts.forEach((post) => {
      if (post.article) {
        post.article.reactions.forEach((reaction) => {
          const date = new Date(reaction.createdAt);
          const key = date.toISOString().substr(0, 7);
          reactions[key] += 1;
        });
      } else {
        post.question.reactions.forEach((reaction) => {
          const date = new Date(reaction.createdAt);
          const key = date.toISOString().substr(0, 7);
          reactions[key] += 1;
        });
      }
    });

    return reactions;
  }

  async requestAuthorRole(id: string) {
    const request = await this.prisma.authorRequest.findUnique({
      where: { userId: id },
    });

    if (request) {
      return await this.prisma.authorRequest.delete({
        where: { userId: id },
      });
    } else {
      return await this.prisma.authorRequest.create({
        data: {
          user: { connect: { id } },
          status: 'PENDING',
        },
      });
    }
  }

  async respondToAuthorRequest(id: string, status: RequestStatus) {
    const request = await this.prisma.authorRequest.findUnique({
      where: { userId: id },
    });

    if (request) {
      await this.prisma.user.update({ where: { id }, data: { role: 'USER' } });
      return await this.prisma.authorRequest.delete({
        where: { userId: id },
      });
    } else {
      if (status === 'ACCEPTED') {
        await this.prisma.user.update({
          where: { id },
          data: { role: 'AUTHOR' },
        });
      }
      return await this.prisma.authorRequest.create({
        data: {
          user: { connect: { id } },
          status,
        },
      });
    }
  }

  async generateFeed(page: number, perPage: number, id: string) {
    if (id === 'undefined') {
      return await this.postService.findAll(page, perPage);
    } else {
      const pagination = {
        take: perPage,
        skip: (page - 1) * perPage,
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

      const includePost = {
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
      };

      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          followings: true,
          followedTags: true,
          articleReactions: {
            select: {
              article: { select: { posts: { select: { tags: true } } } },
            },
          },
          questionReactions: {
            include: {
              question: { select: { posts: { select: { tags: true } } } },
            },
          },
        },
      });

      const followedAuthors = user?.followings.map((author) => author.id);
      const followedTags = user?.followedTags.map((tag) => {
        return tag.tagName;
      });
      const tagsRelatedToReactions = [
        ...user?.articleReactions
          .map((reaction) =>
            reaction.article.posts[0].tags.map((tag) => tag.id),
          )
          .flat(),
        ...user?.questionReactions
          .map((reaction) =>
            reaction.question.posts[0].tags.map((tag) => tag.id),
          )
          .flat(),
      ];

      const postsFromFollowings = await this.prisma.post.findMany({
        ...pagination,
        where: {
          OR: [
            { author: { id: { in: followedAuthors } } },
            {
              tags: {
                some: { OR: followedTags.map((name) => ({ tag: { name } })) },
              },
            },
          ],
          createdAt: {
            gte: subWeeks(new Date(), 1),
          },
        },
        ...includePost,
        orderBy: [
          {
            article: { reactions: { _count: 'desc' } },
          },
          { question: { reactions: { _count: 'desc' } } },
        ],
      });

      const postsFromReactions = await this.prisma.post.findMany({
        ...pagination,
        where: {
          tags: { some: { id: { in: tagsRelatedToReactions } } },
          createdAt: {
            gte: subWeeks(new Date(), 1),
          },
        },
        ...includePost,
        orderBy: [
          {
            article: { reactions: { _count: 'desc' } },
          },
          { question: { reactions: { _count: 'desc' } } },
        ],
      });

      const ownPosts = await this.prisma.post.findMany({
        ...pagination,
        where: {
          author: { id: id },
        },
        ...includePost,
        orderBy: {
          createdAt: 'desc',
        },
      });

      const newPosts = await this.prisma.post.findMany({
        ...pagination,
        where: {
          createdAt: {
            gte: subWeeks(new Date(), 1),
          },
        },
        ...includePost,
        orderBy: [
          {
            article: { reactions: { _count: 'desc' } },
          },
          { question: { reactions: { _count: 'desc' } } },
        ],
      });

      const trendingPosts = await this.prisma.post.findMany({
        ...pagination,
        where: {
          createdAt: {
            gte: subWeeks(new Date(), 1),
          },
        },
        ...includePost,
        orderBy: [
          {
            article: { reactions: { _count: 'desc' } },
          },
          { question: { reactions: { _count: 'desc' } } },
        ],
      });

      const oldPosts = await this.prisma.post.findMany({
        ...pagination,
        where: {
          createdAt: {
            lt: subWeeks(new Date(), 1),
          },
        },
        ...includePost,
        orderBy: [
          {
            article: { reactions: { _count: 'desc' } },
          },
          { question: { reactions: { _count: 'desc' } } },
        ],
      });

      const primaryFeed = postsFromFollowings.concat(
        postsFromReactions.filter(
          (post) => !postsFromFollowings.some((p) => p.id === post.id),
        ),
      );

      const primaryFeedWithOwnPosts = primaryFeed.concat(
        ownPosts.filter((post) => !primaryFeed.some((p) => p.id === post.id)),
      );

      const primaryFeedWithNewPosts = primaryFeedWithOwnPosts.concat(
        newPosts.filter(
          (post) => !primaryFeedWithOwnPosts.some((p) => p.id === post.id),
        ),
      );

      const primaryFeedWithTrendingPosts = primaryFeedWithNewPosts.concat(
        trendingPosts.filter(
          (post) => !primaryFeedWithNewPosts.some((p) => p.id === post.id),
        ),
      );

      const primaryFeedWithOldPosts = primaryFeedWithTrendingPosts.concat(
        oldPosts.filter(
          (post) => !primaryFeedWithTrendingPosts.some((p) => p.id === post.id),
        ),
      );

      if (primaryFeed.length > 10) {
        return primaryFeed.slice(0, 10);
      } else if (primaryFeedWithOwnPosts.length > 10) {
        return primaryFeedWithOwnPosts.slice(0, 10);
      } else if (primaryFeedWithNewPosts.length > 10) {
        return primaryFeedWithNewPosts.slice(0, 10);
      } else if (primaryFeedWithTrendingPosts.length > 10) {
        return primaryFeedWithTrendingPosts.slice(0, 10);
      } else {
        return primaryFeedWithOldPosts.slice(0, 10);
      }
    }
  }
}
