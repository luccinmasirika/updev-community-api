import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get(':id')
  findAll(@Param('id') id: string) {
    return this.notificationsService.findAll(id);
  }

  @Get(':id/count')
  getCount(@Param('id') id: string) {
    return this.notificationsService.getNotificationsCount(id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.notificationsService.readNotification(id);
  }

  @Patch(':id/all')
  updateAll(@Param('id') userId: string) {
    return this.notificationsService.readAllNotification(userId);
  }
}
