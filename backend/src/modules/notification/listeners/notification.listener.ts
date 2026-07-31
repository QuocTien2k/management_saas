import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from '../notification.service';
import { TaskAssignedEvent, TaskCommentEvent, MemberInvitedEvent } from '../events/notification.events';

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger('NotificationListener');

  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent('task.assigned')
  async handleTaskAssignedEvent(event: TaskAssignedEvent) {
    this.logger.log(`Handling task.assigned event for user ${event.userId}`);
    try {
      await this.notificationService.createNotification({
        userId: event.userId,
        type: event.type,
        title: event.title,
        message: event.message,
        link: event.link,
        workspaceId: event.workspaceId,
      });
    } catch (error) {
      this.logger.error(`Failed to create task.assigned notification: ${error.message}`);
    }
  }

  @OnEvent('task.commented')
  async handleTaskCommentEvent(event: TaskCommentEvent) {
    this.logger.log(`Handling task.commented event for user ${event.userId}`);
    try {
      await this.notificationService.createNotification({
        userId: event.userId,
        type: event.type,
        title: event.title,
        message: event.message,
        link: event.link,
        workspaceId: event.workspaceId,
      });
    } catch (error) {
      this.logger.error(`Failed to create task.commented notification: ${error.message}`);
    }
  }

  @OnEvent('member.invited')
  async handleMemberInvitedEvent(event: MemberInvitedEvent) {
    this.logger.log(`Handling member.invited event for user ${event.userId}`);
    try {
      await this.notificationService.createNotification({
        userId: event.userId,
        type: event.type,
        title: event.title,
        message: event.message,
        link: event.link,
        workspaceId: event.workspaceId,
      });
    } catch (error) {
      this.logger.error(`Failed to create member.invited notification: ${error.message}`);
    }
  }
}
