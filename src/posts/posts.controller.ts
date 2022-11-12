import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.postsService.getPostBySlug(slug);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
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

  // get all bookmarks of a user
  @Get('bookmarks/:userId')
  getBookmarks(@Param('userId') userId: string) {
    return this.postsService.getBookmarks(userId);
  }

  // get all reactions of a post
  @Get(':id/reactions/posts')
  getReactions(@Param('id') id: string) {
    return this.postsService.getAllReactionsOfPost(id);
  }
}
