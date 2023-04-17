import { PartialType } from '@nestjs/swagger';
import { CreateDataManagementDto } from './create-data-management.dto';

export class UpdateDataManagementDto extends PartialType(CreateDataManagementDto) {}
