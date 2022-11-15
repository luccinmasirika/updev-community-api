import { ConflictException, Injectable } from '@nestjs/common';
import * as bycrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName } = createUserDto;
    const hashedPassword = await this.hashPassword(password);

    const username = await this.checkUsername(
      email.split('@')[0].replace(/\s/g, ''),
    );

    const user = await this.prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        username,
        password: hashedPassword,
        role: 'USER',
      },
    });

    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: {
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        profile: {
          upsert: {
            create: {
              ...(updateUserDto.avatar && {
                avatar: {
                  connect: {
                    id: updateUserDto.avatar,
                  },
                },
              }),
              bio: updateUserDto.bio,
              gitHub: updateUserDto.gitHub,
              twitter: updateUserDto.twitter,
              linkedIn: updateUserDto.linkedIn,
              job: updateUserDto.job,
              phone: updateUserDto.phone,
            },
            update: {
              ...(updateUserDto.avatar && {
                avatar: {
                  connect: {
                    id: updateUserDto.avatar,
                  },
                },
              }),
              bio: updateUserDto.bio,
              gitHub: updateUserDto.gitHub,
              twitter: updateUserDto.twitter,
              linkedIn: updateUserDto.linkedIn,
              job: updateUserDto.job,
              phone: updateUserDto.phone,
            },
          },
        },
      },
    });
  }

  async findOneByEmail(email: string) {
    return await this.prisma.user.findFirst({
      where: { email },
      include: { profile: true },
    });
  }

  async findOneById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async getUsers() {
    return await this.prisma.user.findMany({
      include: { profile: true },
    });
  }

  async getUserByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: { username },
      include: {
        profile: { include: { avatar: true } },
        posts: {
          orderBy: { createdAt: 'desc' },
          include: { article: { include: { image: true } }, question: true },
        },
        comments: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async hashPassword(pwd: string) {
    return await bycrypt.hash(pwd, 10);
  }

  async activateUser(id: string) {
    return await this.prisma.user.update({
      where: { id },
      data: {
        accountStatus: 'ACTIVE',
      },
    });
  }

  async disableAccount(id: string) {
    return await this.prisma.user.update({
      where: { id },
      data: {
        accountStatus: 'DISABLED',
      },
    });
  }

  async deleteAccount(id: string) {
    return await this.prisma.user.update({
      where: { id },
      data: {
        accountStatus: 'DELETED',
      },
    });
  }

  // check if username exists in database and return username plus a number if it does
  async checkUsername(username: string) {
    const user = await this.prisma.user.findFirst({
      where: { username },
    });

    if (user) {
      const usernameArray = username.split('');
      const lastChar = usernameArray[usernameArray.length - 1];
      if (isNaN(Number(lastChar))) {
        usernameArray.push('1');
      } else {
        const newNumber = Number(lastChar) + 1;
        usernameArray.pop();
        usernameArray.push(newNumber.toString());
      }
      return this.checkUsername(usernameArray.join(''));
    } else {
      return username;
    }
  }

  async updateAllUsernames() {
    const users = await this.prisma.user.findMany();
    return await Promise.all(
      users.map((user) => {
        const username = user.email.split('@')[0].replace(/\s/g, '');
        return this.prisma.user.update({
          where: { id: user.id },
          data: {
            username: username.toLowerCase(),
          },
          select: { email: true, username: true },
        });
      }),
    );
  }
}
