import { ApiProperty } from '@nestjs/swagger';
import { Locale, PostType } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    format: 'string',
    example: 'lorem ipsum',
  })
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    format: 'string',
    example: '12/12/2020',
  })
  eventDate: string;

  
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    format: 'string',
    example: '12/12/2020',
  })
  eventLocation: string;

  
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    format: 'string',
    example: '12/12/2020',
  })
  eventLink: string;

  @IsString()
  @ApiProperty({
    type: String,
    format: 'string',
    example: Locale.EN,
  })
  locale: Locale;

  @IsString()
  @ApiProperty({
    type: String,
    format: 'string',
    example: 'lorem ipsum',
  })
  content: string;

  @IsOptional()
  @ApiProperty({
    type: String,
    format: 'string',
    example: 'lorem ipsum',
  })
  series: string;

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
  publishedOn?: string;

  @IsOptional()
  @ApiProperty({
    type: Boolean,
    format: 'string',
    example: true,
  })
  draft?: boolean;

  @IsOptional()
  @ApiProperty({
    type: Boolean,
    format: 'string',
    example: true,
  })
  survey?: boolean;

  @IsOptional()
  @ApiProperty({
    type: Array,
    format: 'string',
    example: true,
  })
  surveyOptions?: string[];

  @IsOptional()
  @ApiProperty({
    type: String,
    format: 'string',
    example: true,
  })
  surveyQuestion?: string;

  @IsOptional()
  @ApiProperty({
    type: Number,
    format: 'string',
    example: true,
  })
  duration?: number;
}
