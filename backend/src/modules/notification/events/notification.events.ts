import { NotificationType } from '@prisma/client';

export class NotificationEvent {
  constructor(
    public readonly type: NotificationType,
    public readonly userId: string,
    public readonly title: string,
    public readonly message: string,
    public readonly link?: string,
    public readonly workspaceId?: string,
  ) {}
}

export class TaskAssignedEvent extends NotificationEvent {
  constructor(
    userId: string,
    title: string,
    message: string,
    link: string,
    workspaceId: string,
  ) {
    super(NotificationType.TASK_ASSIGNED, userId, title, message, link, workspaceId);
  }
}

export class TaskCommentEvent extends NotificationEvent {
  constructor(
    userId: string,
    title: string,
    message: string,
    link: string,
    workspaceId: string,
  ) {
    super(NotificationType.TASK_COMMENT, userId, title, message, link, workspaceId);
  }
}

export class MemberInvitedEvent extends NotificationEvent {
  constructor(
    userId: string,
    title: string,
    message: string,
    link: string,
    workspaceId: string,
  ) {
    super(NotificationType.MEMBER_INVITED, userId, title, message, link, workspaceId);
  }
}
