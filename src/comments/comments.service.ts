import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { CommentReactionType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pushNotification: NotificationsService,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    const { author, post, content, parentComment, depth } = createCommentDto;
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
        ...(parentComment && {
          parentComment: {
            connect: {
              id: parentComment,
            },
          },
        }),
        depth,
      },
      include: {
        author: { include: { profile: { include: { avatar: true } } } },
        post: true,
        _count: true
      },
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
      include: {
        childrenComments: true,
        parentComment: true,
        reactions: {
          include: {
            comment: {
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
              },
            },
            user: {
              include: {
                profile: {
                  include: {
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  findPostComment(postSlug: string) {
    return this.prisma.postComment.findMany({
      orderBy: [{ createdAt: 'desc' }],
      where: { post: { slug: postSlug }, depth: { equals: 0 } },
      include: {
        childrenComments: {
          select: { _count: { select: { childrenComments: true } } },
        },
        reactions: {
          include: {
            user: {
              include: {
                profile: {
                  include: {
                    avatar: true,
                  },
                },
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
        _count: true,
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.postComment.findFirst({
      where: { id },
      include: {
        childrenComments: this.populatePost,
        parentComment: this.populatePost,
        reactions: this.populateReactions,
        author: this.populateProfile,
      },
    });
  }

  async getAllParentsComment(commentId: string) {
    const parentComments = [];
    const getParentsComment = async (commentId: string) => {
      const comment = await this.findOne(commentId);
      if (comment.parentCommentId) {
        parentComments.push(comment.parentComment);
        parentComments.concat(await getParentsComment(comment.parentCommentId));
      }
      return parentComments;
    };
    return (await getParentsComment(commentId)).reverse();
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

  async reactToPostComment(
    commentId: string,
    userId: string,
    type: CommentReactionType,
  ) {
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const reaction = await this.prisma.commentReaction.findUnique({
      where: {
        commentId_userId: {
          commentId: commentId,
          userId,
        },
      },
    });

    if (reaction) {
      if (reaction.type === type) {
        await this.prisma.commentReaction.delete({
          where: {
            commentId_userId: {
              commentId: comment.id,
              userId,
            },
          },
        });
      } else {
        await this.prisma.commentReaction.update({
          where: {
            commentId_userId: {
              commentId: comment.id,
              userId,
            },
          },
          data: {
            type,
          },
        });

        // this.pushNotification.create({
        //   from: userId,
        //   to: comment.userId,
        //   target: comment.postId,
        //   type,
        // });
      }
    } else {
      const test = await this.prisma.commentReaction.create({
        data: {
          type,
          user: {
            connect: {
              id: userId,
            },
          },
          comment: {
            connect: {
              id: commentId,
            },
          },
        },
      });

      // this.pushNotification.create({
      //   from: userId,
      //   to: comment.userId,
      //   target: comment.postId,
      //   type,
      // });
    }

    return 'Reaction added';
  }

  populateProfile = {
    include: {
      profile: {
        include: {
          avatar: true,
        },
      },
    },
  };

  populateReactions = {
    include: {
      user: this.populateProfile,
    },
  };

  populatePost = {
    include: {
      author: this.populateProfile,
      reactions: this.populateReactions,
      childrenComments: true,
      _count: { select: { childrenComments: true } },
    },
  };
}
