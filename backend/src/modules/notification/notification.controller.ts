import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() user: User,
    @Query('isRead') isRead?: string,
    @Query('workspaceId') workspaceId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: any = {};
    if (isRead !== undefined) {
      filters.isRead = isRead === 'true';
    }
    if (workspaceId) {
      filters.workspaceId = workspaceId;
    }
    if (page) {
      filters.page = parseInt(page, 10);
    }
    if (limit) {
      filters.limit = parseInt(limit, 10);
    }

    return this.notificationService.findAllForUser(user.id, filters);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async readAll(
    @CurrentUser() user: User,
    @Query('workspaceId') workspaceId?: string,
  ) {
    return this.notificationService.markAllAsRead(user.id, workspaceId);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async read(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.notificationService.markAsRead(id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.notificationService.deleteNotification(id, user.id);
  }
}
