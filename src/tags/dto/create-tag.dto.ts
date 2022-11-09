import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @ApiProperty({
    type: String,
    format: 'string',
    example: 'JavaScript',
  })
  name: string;
}
