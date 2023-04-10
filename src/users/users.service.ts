import { Injectable, NotFoundException } from '@nestjs/common';
import { PostType, RequestStatus } from '@prisma/client';
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
      username: newUsername,
    } = updateUserDto;
    const username = await this.checkUsername(newUsername);
    return this.prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        username,
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

  async findOneById(id?: string) {
    if (!id) throw new NotFoundException('User not found');
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: { include: { avatar: true } },
        posts: {
          orderBy: { createdAt: 'desc' },
          include: { article: { include: { image: true } }, question: true },
        },
        authorRequest: {
          where: {
            user: {
              id,
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
    const followings = await this.prisma.followAuthors.findMany({
      where: {
        userId: id,
        author: { accountStatus: 'ACTIVE', role: 'AUTHOR' },
      },
      include: {
        author: {
          include: {
            profile: {
              include: {
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
    });

    return followings.map((following) => ({
      user: following.author,
    }));
  }

  // get all user followers
  async getUserFollowers(id: string) {
    return await this.prisma.followAuthors.findMany({
      where: { authorId: id },
      include: {
        user: {
          include: {
            profile: {
              include: {
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
    });
  }

  // get weekly user views
  async getDailyViewsForWeek(id: string) {
    const year = new Date().getFullYear();
    const month = getMonth(new Date());
    const date = getDate(new Date());
    const start = startOfWeek(new Date(year, month, date), {
      weekStartsOn: 1,
    });
    const end = endOfWeek(new Date(year, month, date), { weekStartsOn: 1 });
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
      weekStartsOn: 1,
    });
    const end = endOfWeek(new Date(year, month, date), { weekStartsOn: 1 });
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
    const start = startOfYear(new Date());
    const end = endOfYear(new Date());
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
    const start = subMonths(startOfYear(new Date()), 1);
    const end = subMonths(endOfYear(new Date()), 1);
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

  // get periodical between two dates user views
  async getPeriodicalViews(id: string, start: any, end: any) {
    const days = eachDayOfInterval({
      start: new Date(start),
      end: new Date(end),
    });

    const posts = await this.prisma.postViews.findMany({
      where: {
        userId: id,
        createdAt: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const views = days.reduce((acc, day) => {
      const key = day.toLocaleDateString();
      acc[key] = 0;
      return acc;
    }, {});

    posts.forEach((post) => {
      const date = new Date(post.createdAt);
      const key = date.toLocaleDateString();
      views[key] += 1;
    });

    return views;
  }

  // get periodical between two dates user's post reactions
  async getPeriodicalReactions(id: string, start: any, end: any) {
    const days = eachDayOfInterval({
      start: new Date(start),
      end: new Date(end),
    });

    const posts = await this.prisma.post.findMany({
      where: {
        author: { id },
        createdAt: {
          gte: new Date(start),
          lte: new Date(end),
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
      const key = day.toLocaleDateString();
      acc[key] = 0;
      return acc;
    }, {});

    posts.forEach((post) => {
      if (post.article) {
        post.article.reactions.forEach((reaction) => {
          const date = new Date(reaction.createdAt);
          const key = date.toLocaleDateString();
          reactions[key] += 1;
        });
      } else {
        post.question.reactions.forEach((reaction) => {
          const date = new Date(reaction.createdAt);
          const key = date.toLocaleDateString();
          reactions[key] += 1;
        });
      }
    });

    return reactions;
  }

  // get percentage of views for user's posts
  async getViewsPercentage(id: string) {
    const posts = await this.prisma.post.findMany({
      where: { author: { id } },
      include: { views: true },
    });

    const totalViews = posts.reduce((acc, post) => {
      acc += post.views.length;
      return acc;
    }, 0);

    const viewsPercentage = posts.map((post) => {
      const percentage = (post.views.length / totalViews) * 100;
      return {
        id: post.id,
        title: post.title,
        percentage: percentage.toFixed(2),
      };
    });

    return viewsPercentage;
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
      } else {
        await this.prisma.user.update({
          where: { id },
          data: { role: 'USER' },
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

  async generateFeed(
    page: number,
    perPage: number,
    id: string,
    type?: PostType,
  ) {
    if (id === 'undefined') {
      return await this.postService.findAll(page, perPage);
    }

    const intervale = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);

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
        username: true,
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
        _count: { select: { comments: true, views: true } },
        bookmarks: true,
        survey: {
          include: {
            options: {
              include: {
                votes: {
                  include: {
                    option: true,
                    user: author,
                  },
                },
              },
            },
            question: true,
          },
        },
      },
    };

    const getFollowedAuthors = this.prisma.followAuthors.findMany({
      where: { userId: id },
      select: { authorId: true },
    });

    const getFollowedTags = this.prisma.followTags.findMany({
      where: { userId: id },
      select: { tagName: true },
    });

    const getReactedPosts = await this.prisma.post.findMany({
      where: {
        draft: false,
        OR: [
          {
            question: {
              reactions: {
                some: {
                  userId: id,
                },
              },
            },
          },
          {
            article: {
              reactions: {
                some: {
                  userId: id,
                },
              },
            },
          },
        ],
      },
      select: { tags: { select: { tag: { select: { name: true } } } } },
    });

    const [followedAuthors, followedTags, reactedPosts] = await Promise.all([
      getFollowedAuthors,
      getFollowedTags,
      getReactedPosts,
    ]);

    const tagsRelatedToReactions = reactedPosts
      .map((item) => item.tags.map((el) => el.tag.name))
      .flat();

    const getPostsFromFollowings = this.prisma.post.findMany({
      ...pagination,
      where: {
        draft: false,
        ...(type && { type }),
        OR: [
          {
            author: {
              OR: followedAuthors.map((el) => ({ id: el.authorId })),
            },
          },
          {
            tags: {
              some: {
                OR: followedTags.map((el) => ({ tag: { name: el.tagName } })),
              },
            },
          },
        ],
        createdAt: {
          gte: intervale,
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

    const getPostsFromReactions = this.prisma.post.findMany({
      ...pagination,
      where: {
        draft: false,
        ...(type && { type }),
        tags: {
          some: {
            OR: tagsRelatedToReactions.map((tagName) => ({
              tag: { name: tagName },
            })),
          },
        },
        createdAt: {
          gte: intervale,
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

    const getOwnPosts = this.prisma.post.findMany({
      ...pagination,
      where: {
        draft: false,
        author: { id: id },
        ...(type && { type }),
        createdAt: {
          gte: intervale,
        },
      },
      ...includePost,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const getNewPosts = this.prisma.post.findMany({
      ...pagination,
      where: {
        draft: false,
        ...(type && { type }),
        createdAt: {
          gte: intervale,
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

    const getTrendingPosts = this.prisma.post.findMany({
      ...pagination,
      where: {
        draft: false,
        ...(type && { type }),
        createdAt: {
          gte: intervale,
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

    const getOldPosts = this.prisma.post.findMany({
      ...pagination,
      where: {
        draft: false,
        ...(type && { type }),
        createdAt: {
          lt: intervale,
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

    const [
      postsFromFollowings,
      postsFromReactions,
      ownPosts,
      newPosts,
      trendingPosts,
      oldPosts,
    ] = await Promise.all([
      getPostsFromFollowings,
      getPostsFromReactions,
      getOwnPosts,
      getNewPosts,
      getTrendingPosts,
      getOldPosts,
    ]);

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

  async getUserGadges(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id },
      include: {
        posts: true,
        followers: true,
        comments: true,
        questionReactions: true,
        articleReactions: true,
        views: true,
      },
    });

    return [
      {
        name: 'First Post',
        description: 'Write your first post',
        icon: 'first-post',
        completed: user.posts.length > 0,
      },
      {
        name: 'Editor',
        description: 'Write 20 posts',
        icon: 'editor',
        completed: user.posts.length > 20,
      },
      {
        name: 'Followers',
        description: 'Get 10 followers',
        icon: 'followers',
        completed: user.followers.length > 10,
      },
      {
        name: 'First Comments',
        description: 'Write your first comment',
        icon: 'first-comment',
        completed: user.comments.length > 0,
      },
      {
        name: 'First Reactions',
        description: 'React to your first post',
        icon: 'first-reaction',
        completed:
          user.questionReactions.length + user.articleReactions.length > 0,
      },
      {
        name: 'Reactions',
        description: 'React to 10 posts',
        icon: 'reactions',
        completed:
          user.questionReactions.length + user.articleReactions.length > 10,
      },
      {
        name: 'Views',
        description: 'Get 100 views',
        icon: 'views',
        completed: user.views.length > 100,
      },
      {
        name: 'Creator',
        description: 'Become a creator',
        icon: 'creator',
        completed: user.role === 'AUTHOR',
      },
      {
        name: 'Ancestor',
        description: 'Join the community more than a month ago',
        icon: 'ancestor',
        completed:
          user.createdAt <
          new Date(new Date().setMonth(new Date().getMonth() - 1)),
      },
      {
        name: 'New Member',
        description: 'Welcome to our community!',
        icon: 'new-member',
        completed: true,
      },
    ];
  }
}
