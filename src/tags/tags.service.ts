import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}
  create(createTagDto: CreateTagDto) {
    return this.prisma.tags.create({data: {name: createTagDto.name}})
  }

  async findAll(name: string) {
    return await this.prisma.tags.findMany({
      where: { ...(name && { name: { contains: name } }) },
      include: { _count: true },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} tag`;
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    return `This action updates a #${id} tag`;
  }

  remove(id: number) {
    return `This action removes a #${id} tag`;
  }
}
