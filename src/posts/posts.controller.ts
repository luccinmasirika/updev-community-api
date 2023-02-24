import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ArticleReactionType,
  PostType,
  QuestionReactionType,
} from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';
import { PostsService } from './posts.service';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Post('series')
  createSeries(@Body() createSeriesDto: CreateSeriesDto) {
    return this.postsService.createSeries(createSeriesDto);
  }

  @Patch(':id/series')
  updateSeries(@Param('id') id: string, @Body() updateSeries: UpdateSeriesDto) {
    return this.postsService.updateSeries(id, updateSeries);
  }

  @Delete('series/:id')
  deleteSeries(@Param('id') id: string) {
    return this.postsService.deleteSeries(id);
  }
  
  @Get('series')
  getSeries(
    @Query('seriesId') seriesId: string,
    @Query('userId') userId: string,
  ) {
    return this.postsService.getSeries({ seriesId, userId });
  }

  @Get()
  findAll(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @Query('type') type: PostType,
    @Query('tagNames') tagNames: string[],
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('search') search: string,
    @Query('status') status: string,
  ) {
    return this.postsService.findAll(
      +page || 1,
      +perPage,
      {
        type,
        tagNames,
        userId,
        status,
        dateRange: {
          startDate,
          endDate,
        },
      },
      search,
    );
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.postsService.getPostBySlug(slug);
  }

  // on vote
  @Patch(':userId/vote')
  async vote(
    @Param('userId') userId: string,
    @Body() data: { optionId: string; surveyId: string },
  ) {
    const { optionId, surveyId } = data;
    return this.postsService.createVote(surveyId, optionId, userId);
  }

  @Get('bookmarks/:userId')
  getBookmarks(
    @Param('userId') userId: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return this.postsService.getBookmarks(userId, +page, +perPage);
  }

  @Get(':id/reactions/posts')
  getReactions(@Param('id') id: string) {
    return this.postsService.getAllReactionsOfPost(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.updatePost(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }

  @Get('by/tags')
  getPostsByTag(
    @Query('tags') tags: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return this.postsService.getPostsByTags(tags?.split(','), +page, +perPage);
  }

  @Post('suggestions')
  getPostsSuggestionsByTag(
    @Body() body: { tags: string[]; type: PostType; postId: string },
  ) {
    const { tags, type, postId } = body;
    return this.postsService.getPostsSuggestionsByTags(tags, type, postId);
  }

  @Get('author/:authorId')
  getPostsByAuthor(@Param('authorId') authorId: string) {
    return this.postsService.getPostsByAuthor(authorId);
  }

  @Get('get/top')
  getTopPosts(
    @Query('limit') limit: number,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('type') type: PostType,
  ) {
    return this.postsService.getTopPosts({
      start: startDate,
      end: endDate,
      limit: +limit,
      type,
    });
  }

  @Get('top/authors')
  getTopAuthors() {
    return this.postsService.getTopAuthors();
  }

  @Patch(':id/reactions/:type/:userId/question')
  addReactionToQuestion(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Param('type') type: QuestionReactionType,
  ) {
    return this.postsService.reactToQuestionPost(id, userId, type);
  }

  @Patch(':id/reactions/:type/:userId/article')
  addReactionToArticle(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Param('type') type: ArticleReactionType,
  ) {
    return this.postsService.reactToArticlePost(id, userId, type);
  }

  @Patch(':id/bookmarks/:userId')
  addToBookmarks(@Param('id') id: string, @Param('userId') userId: string) {
    return this.postsService.addToBookmarks(id, userId);
  }
}
