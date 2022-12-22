import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
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
  @ApiProperty({
    type: String,
    format: 'string',
    example: 'lorem ipsum',
  })
  post: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    format: 'string',
    example: 'lorem ipsum',
  })
  parentComment?: string;

  @ApiProperty({})
  depth?: number;
}
