import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagsService } from './tags.service';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Get()
  findAll(@Query('name') name: string) {
    return this.tagsService.findAll(name);
  }

  @Patch('follow/:tagName/:userId')
  follow(@Param('tagName') tagName: string, @Param('userId') userId: string) {
    return this.tagsService.followTag(tagName, userId);
  }

  @Get('followed/:userId')
  getFollowedTags(@Param('userId') userId: string) {
    return this.tagsService.getFollowedTags(userId);
  }
}
