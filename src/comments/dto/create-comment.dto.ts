import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

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
}
