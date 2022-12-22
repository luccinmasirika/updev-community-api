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
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

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
      +perPage || 10,
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

  // post by slug
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.postsService.getPostBySlug(slug);
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

  // get post suggestions by tags
  @Post('suggestions')
  getPostsSuggestionsByTag(@Body() body: { tags: string[]; type: PostType }) {
    return this.postsService.getPostsSuggestionsByTags(body.tags, body.type);
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
