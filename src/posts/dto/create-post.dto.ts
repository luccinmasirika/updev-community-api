import { ApiProperty } from '@nestjs/swagger';
import { PostType } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @ApiProperty({
    type: String,
    format: 'string',
    example: 'lorem ipsum',
  })
  title: string;

  @IsString()
  @ApiProperty({
    type: String,
    format: 'string',
    example: 'lorem ipsum',
  })
  content: string;

  @IsString()
  @ApiProperty({
    type: String,
    format: 'string',
    example: 'lorem ipsum',
  })
  author: string;

  @IsString()
  @IsEnum(PostType)
  @ApiProperty({
    type: String,
    format: 'string',
    example: PostType.QUESTION,
  })
  type: PostType;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    type: Array,
    format: 'array',
    example: ['lorem ipsum', 'lorem ipsum 2'],
  })
  tags: string[];

  @IsOptional()
  @ApiProperty({
    type: String,
    format: 'string',
    example: 'lorem ipsum',
  })
  image: string;

  @IsOptional()
  @ApiProperty({
    type: String,
    format: 'string',
    example: 'lorem ipsum',
  })
  publishedOn: string;

  @IsOptional()
  @ApiProperty({
    type: Boolean,
    format: 'string',
    example: true,
  })
  draft: boolean;
}
