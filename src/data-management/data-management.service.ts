import { Injectable } from '@nestjs/common';
import { CreateDataManagementDto } from './dto/create-data-management.dto';
import { SearchDataManagementDto } from './dto/search-data-management.dto';
import { UpdateDataManagementDto } from './dto/update-data-management.dto';

@Injectable()
export class DataManagementService {
  search(searchDataManagementDto: SearchDataManagementDto) {
    return 'This action returns a #${id} dataManagement';
  }

  create(createDataManagementDto: CreateDataManagementDto) {
    return 'This action adds a new dataManagement';
  }

  findAll() {
    return `This action returns all dataManagement`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dataManagement`;
  }

  update(id: number, updateDataManagementDto: UpdateDataManagementDto) {
    return `This action updates a #${id} dataManagement`;
  }

  remove(id: number) {
    return `This action removes a #${id} dataManagement`;
  }
}
