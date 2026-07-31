import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(data: {
    action: string;
    entityType: string;
    entityId: string;
    entityName: string;
    details?: any;
    userId: string;
    workspaceId: string;
    projectId?: string;
    taskId?: string;
  }) {
    return this.prisma.activityLog.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        entityName: data.entityName,
        details: data.details || null,
        userId: data.userId,
        workspaceId: data.workspaceId,
        projectId: data.projectId || null,
        taskId: data.taskId || null,
      },
    });
  }

  async getWorkspaceLogs(
    workspaceId: string,
    filters: { userId?: string; projectId?: string; entityType?: string; limit?: number; page?: number },
  ) {
    const limit = filters.limit ? Number(filters.limit) : 20;
    const page = filters.page ? Number(filters.page) : 1;
    const skip = (page - 1) * limit;

    const where: any = { workspaceId };

    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.projectId) {
      where.projectId = filters.projectId;
    }
    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, fullname: true, avatar: true } },
        },
      }),
      this.prisma.activityLog.count({ where }),
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

  async getProjectLogs(
    projectId: string,
    filters: { limit?: number; page?: number },
  ) {
    const limit = filters.limit ? Number(filters.limit) : 20;
    const page = filters.page ? Number(filters.page) : 1;
    const skip = (page - 1) * limit;

    const where = { projectId };

    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, fullname: true, avatar: true } },
        },
      }),
      this.prisma.activityLog.count({ where }),
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

  async getTaskLogs(
    taskId: string,
    filters: { limit?: number; page?: number },
  ) {
    const limit = filters.limit ? Number(filters.limit) : 20;
    const page = filters.page ? Number(filters.page) : 1;
    const skip = (page - 1) * limit;

    const where = { taskId };

    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, fullname: true, avatar: true } },
        },
      }),
      this.prisma.activityLog.count({ where }),
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
}
