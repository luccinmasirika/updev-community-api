import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiTags } from '@nestjs/swagger';
import { ArticleReactionType, QuestionReactionType } from '@prisma/client';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  findAll(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @Query('type') type: 'ARTICLE' | 'QUESTION',
    @Query('tagNames') tagNames: string[],
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('search') search: string,
    @Query('draft') draft: boolean,
  ) {
    return this.postsService.findAll(+page || 1, +perPage || 10, search, {
      type,
      tagNames,
      userId,
      draft,
      dateRange: {
        startDate,
        endDate,
      },
    });
  }

  // post by slug
  @Get(':slug/single/:userId')
  findOne(@Param('slug') slug: string, @Param('userId') userId: string) {
    console.log('slug', slug);
    return this.postsService.getPostBySlug(slug, userId);
  }

  // get all bookmarks of a user
  @Get('bookmarks/:userId')
  getBookmarks(
    @Param('userId') userId: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return this.postsService.getBookmarks(userId, +page, +perPage);
  }

  // get all reactions of a post
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

  // get post by tag
  @Post('tags')
  getPostsByTag(@Body() tags: string[]) {
    return this.postsService.getPostsByTags(tags);
  }

  // get post by author
  @Get('author/:authorId')
  getPostsByAuthor(@Param('authorId') authorId: string) {
    return this.postsService.getPostsByAuthor(authorId);
  }

  // get top posts of the week
  @Get('top/posts-week')
  getTopPostsOfTheWeek() {
    return this.postsService.getTopPostsOfTheWeek();
  }

  // get top posts
  @Get('top/posts')
  getTopPosts() {
    return this.postsService.getTopPosts();
  }

  // get top authors
  @Get('top/authors')
  getTopAuthors() {
    return this.postsService.getTopAuthors();
  }

  // react to a question
  @Patch(':id/reactions/:type/:userId/question')
  addReactionToQuestion(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Param('type') type: QuestionReactionType,
  ) {
    return this.postsService.reactToQuestionPost(id, userId, type);
  }

  // react to an article
  @Patch(':id/reactions/:type/:userId/article')
  addReactionToArticle(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Param('type') type: ArticleReactionType,
  ) {
    return this.postsService.reactToArticlePost(id, userId, type);
  }

  // add to bookmarks
  @Patch(':id/bookmarks/:userId')
  addToBookmarks(@Param('id') id: string, @Param('userId') userId: string) {
    return this.postsService.addToBookmarks(id, userId);
  }
}
