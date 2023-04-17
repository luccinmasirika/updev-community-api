import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DataManagementService } from './data-management.service';
import { CreateDataManagementDto } from './dto/create-data-management.dto';
import { UpdateDataManagementDto } from './dto/update-data-management.dto';

@Controller('data-management')
export class DataManagementController {
  constructor(private readonly dataManagementService: DataManagementService) {}

  @Get()
  search(
    @Query('search') search: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('sort') sort: string,
    @Query('order') order: string,
    @Query('filters') filters: string,
    @Query('fields') fields: string,
    @Query('include') include: string,
    @Query('exclude') exclude: string,
  ) {
    return this.dataManagementService.search({
      search,
      page,
      limit,
      sort,
      order,
      filters,
      fields,
      include,
      exclude,
    });
  }
}
