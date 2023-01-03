import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommentReactionType } from '@prisma/client';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @Get()
  findAll() {
    return this.commentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Get(':id/parents')
  getAllParents(@Param('id') id: string) {
    return this.commentsService.getAllParentsComment(id);
  }

  @Get(':postSlug/post-comments')
  findPostComment(@Param('postSlug') postSlug: string) {
    return this.commentsService.findPostComment(postSlug);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }

  @Get('author/:authorId')
  getCommentsByAuthor(@Param('authorId') authorId: string) {
    return this.commentsService.getCommentsByAuthor(authorId);
  }

  // react to an article
  @Patch(':id/reactions/:type/:userId')
  addReactionToArticle(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Param('type') type: CommentReactionType,
  ) {
    return this.commentsService.reactToPostComment(id, userId, type);
  }

  // get comment reactions
  @Get(':id/reactions')
  getCommentReactions(@Param('id') id: string) {
    return this.commentsService.getCommentReactions(id);
  }
  
}
