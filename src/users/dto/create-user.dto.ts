import { ApiProperty } from '@nestjs/swagger';
import type { Sex as SexModel } from '@prisma/client';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({
    type: String,
    format: 'email',
    example: 'luccinmasirika@gmail.com',
  })
  email: string;

  @IsString()
  @ApiProperty({
    type: String,
    format: 'string',
    example: 'Luccin',
  })
  firstName: string;

  @IsString()
  @ApiProperty({
    type: String,
    format: 'string',
    example: 'Masirika',
  })
  lastName: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    format: 'string',
    example: '1234',
  })
  password?: string;

  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({
    type: Array,
    format: 'string',
    example: ['cl8lglo0h0000um5ww9n0q9rg'],
  })
  roles: string[];
}
