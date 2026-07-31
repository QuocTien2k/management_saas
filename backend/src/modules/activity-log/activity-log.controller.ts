import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { GetActivityLogDto } from './dto/get-activity-log.dto';
import type { User } from '@prisma/client';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard)
export class ActivityLogController {
  constructor(
    private readonly activityLogService: ActivityLogService,
    private readonly prisma: PrismaService,
  ) {}

  private async checkWorkspaceMember(workspaceId: string, userId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
    });
    if (!member) {
      throw new ForbiddenException('Bạn không có quyền truy cập lịch sử của không gian làm việc này.');
    }
  }

  @Get('workspace/:workspaceId')
  @HttpCode(HttpStatus.OK)
  async getWorkspaceLogs(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
    @Query() dto: GetActivityLogDto,
  ) {
    await this.checkWorkspaceMember(workspaceId, user.id);
    return this.activityLogService.getWorkspaceLogs(workspaceId, dto);
  }

  @Get('project/:projectId')
  @HttpCode(HttpStatus.OK)
  async getProjectLogs(
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
    @Query() dto: GetActivityLogDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại.');
    }
    await this.checkWorkspaceMember(project.workspaceId, user.id);

    return this.activityLogService.getProjectLogs(projectId, dto);
  }

  @Get('task/:taskId')
  @HttpCode(HttpStatus.OK)
  async getTaskLogs(
    @Param('taskId') taskId: string,
    @CurrentUser() user: User,
    @Query() dto: GetActivityLogDto,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });
    if (!task) {
      throw new NotFoundException('Công việc không tồn tại.');
    }
    await this.checkWorkspaceMember(task.project.workspaceId, user.id);

    return this.activityLogService.getTaskLogs(taskId, dto);
  }
}
