import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @ApiProperty({
    type: String,
    format: 'string',
    example: 'lorem ipsum',
  })
  from: string;

  @IsString()
  @ApiProperty({
    type: String,
    format: 'string',
    example: 'lorem ipsum',
  })
  to: string;

  @IsString()
  @ApiProperty({
    type: String,
    format: 'string',
    example: 'lorem ipsum',
  })
  target: string;

  @IsString()
  @ApiProperty({
    type: String,
    format: 'string',
    example: 'COMMENT',
  })
  type: NotificationType;
}
