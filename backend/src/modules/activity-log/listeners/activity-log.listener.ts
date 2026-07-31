import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ActivityLogService } from '../activity-log.service';

@Injectable()
export class ActivityLogListener {
  private readonly logger = new Logger('ActivityLogListener');

  constructor(private readonly activityLogService: ActivityLogService) {}

  @OnEvent('task.created')
  async handleTaskCreated(payload: {
    task: any;
    workspaceId: string;
    userId: string;
  }) {
    this.logger.log(`Logging task.created for task ${payload.task.id}`);
    try {
      await this.activityLogService.createLog({
        action: 'TASK_CREATE',
        entityType: 'TASK',
        entityId: payload.task.id,
        entityName: payload.task.title,
        userId: payload.userId,
        workspaceId: payload.workspaceId,
        projectId: payload.task.projectId,
        taskId: payload.task.id,
        details: {
          title: payload.task.title,
          status: payload.task.status,
          priority: payload.task.priority,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to log task.created: ${err.message}`);
    }
  }

  @OnEvent('task.updated')
  async handleTaskUpdated(payload: {
    task: any;
    workspaceId: string;
    userId: string;
    changes: any;
  }) {
    this.logger.log(`Logging task.updated for task ${payload.task.id}`);
    try {
      await this.activityLogService.createLog({
        action: 'TASK_UPDATE',
        entityType: 'TASK',
        entityId: payload.task.id,
        entityName: payload.task.title,
        userId: payload.userId,
        workspaceId: payload.workspaceId,
        projectId: payload.task.projectId,
        taskId: payload.task.id,
        details: payload.changes,
      });
    } catch (err) {
      this.logger.error(`Failed to log task.updated: ${err.message}`);
    }
  }

  @OnEvent('task.moved')
  async handleTaskMoved(payload: {
    task: any;
    oldColumnName: string;
    newColumnName: string;
    workspaceId: string;
    userId: string;
  }) {
    this.logger.log(`Logging task.moved for task ${payload.task.id}`);
    try {
      await this.activityLogService.createLog({
        action: 'TASK_MOVE',
        entityType: 'TASK',
        entityId: payload.task.id,
        entityName: payload.task.title,
        userId: payload.userId,
        workspaceId: payload.workspaceId,
        projectId: payload.task.projectId,
        taskId: payload.task.id,
        details: {
          fromColumn: payload.oldColumnName,
          toColumn: payload.newColumnName,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to log task.moved: ${err.message}`);
    }
  }

  @OnEvent('task.deleted')
  async handleTaskDeleted(payload: {
    taskId: string;
    taskTitle: string;
    projectId: string;
    workspaceId: string;
    userId: string;
  }) {
    this.logger.log(`Logging task.deleted for task ${payload.taskId}`);
    try {
      await this.activityLogService.createLog({
        action: 'TASK_DELETE',
        entityType: 'TASK',
        entityId: payload.taskId,
        entityName: payload.taskTitle,
        userId: payload.userId,
        workspaceId: payload.workspaceId,
        projectId: payload.projectId,
        taskId: payload.taskId,
      });
    } catch (err) {
      this.logger.error(`Failed to log task.deleted: ${err.message}`);
    }
  }

  @OnEvent('comment.created')
  async handleCommentCreated(payload: {
    comment: any;
    taskId: string;
    taskTitle: string;
    projectId: string;
    workspaceId: string;
    userId: string;
  }) {
    this.logger.log(`Logging comment.created for task ${payload.taskId}`);
    try {
      await this.activityLogService.createLog({
        action: 'COMMENT_CREATE',
        entityType: 'COMMENT',
        entityId: payload.comment.id,
        entityName: `Bình luận của ${payload.comment.user.fullname}`,
        userId: payload.userId,
        workspaceId: payload.workspaceId,
        projectId: payload.projectId,
        taskId: payload.taskId,
        details: {
          content: payload.comment.content.substring(0, 100),
          taskTitle: payload.taskTitle,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to log comment.created: ${err.message}`);
    }
  }
}
