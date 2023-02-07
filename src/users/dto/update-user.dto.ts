import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  avatar: string;
  phone: string;
  bio: string;
  linkedIn: string;
  gitHub: string;
  twitter: string;
  job: string;
  username: string
}
