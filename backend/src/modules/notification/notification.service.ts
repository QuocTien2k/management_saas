import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationGateway,
  ) {}

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    workspaceId?: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link || null,
        workspaceId: data.workspaceId || null,
      },
    });

    // Phát socket realtime
    this.gateway.sendNotificationToUser(data.userId, notification);

    return notification;
  }

  async findAllForUser(
    userId: string,
    filters: { isRead?: boolean; workspaceId?: string; limit?: number; page?: number },
  ) {
    const limit = filters.limit ? Number(filters.limit) : 20;
    const page = filters.page ? Number(filters.page) : 1;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (filters.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    if (filters.workspaceId) {
      where.workspaceId = filters.workspaceId;
    }

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Thông báo không tồn tại hoặc không thuộc quyền sở hữu của bạn.');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    this.gateway.sendNotificationReadToUser(userId, id);
    return updated;
  }

  async markAllAsRead(userId: string, workspaceId?: string) {
    const where: any = { userId, isRead: false };
    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    await this.prisma.notification.updateMany({
      where,
      data: { isRead: true },
    });

    this.gateway.sendAllNotificationsReadToUser(userId);
    return { message: 'Đã đánh dấu đọc tất cả thông báo thành công.' };
  }

  async deleteNotification(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Thông báo không tồn tại hoặc không thuộc quyền sở hữu của bạn.');
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    return { message: 'Đã xóa thông báo thành công.' };
  }
}
