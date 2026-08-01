import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskGateway } from './task.gateway';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateLabelDto } from './dto/create-label.dto';
import { WorkspaceRole, TaskStatus, TaskPriority } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskAssignedEvent, TaskCommentEvent } from '../notification/events/notification.events';

@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private taskGateway: TaskGateway,
    private eventEmitter: EventEmitter2,
  ) {}

  // Helper để kiểm tra quyền truy cập của User vào Project
  private async checkProjectAccess(projectId: string, userId: string, requiredRoles?: WorkspaceRole[]) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundException('Dự án không tồn tại hoặc đã bị xóa.');
    }

    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: project.workspaceId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Bạn không có quyền truy cập dự án này.');
    }

    if (requiredRoles && !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Bạn không có quyền thực hiện hành động này.');
    }

    return { project, membership };
  }

  // Helper kiểm tra quyền qua Task
  private async checkTaskAccess(taskId: string, userId: string, requiredRoles?: WorkspaceRole[]) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
    });

    if (!task) {
      throw new NotFoundException('Công việc không tồn tại hoặc đã bị xóa.');
    }

    const access = await this.checkProjectAccess(task.projectId, userId, requiredRoles);
    return { task, ...access };
  }

  // Helper tìm cột Kanban an toàn theo columnId (UUID) hoặc TaskStatus (enum)
  private async findProjectColumn(projectId: string, targetIdOrStatus: string) {
    const isEnumStatus = Object.values(TaskStatus).includes(targetIdOrStatus as TaskStatus);

    return this.prisma.projectColumn.findFirst({
      where: {
        projectId,
        ...(isEnumStatus
          ? {
              OR: [
                { id: targetIdOrStatus },
                { status: targetIdOrStatus as TaskStatus },
              ],
            }
          : { id: targetIdOrStatus }),
      },
    });
  }

  // ==========================================
  // SECTION 1: TASK CRUD & MOVE
  // ==========================================

  async createTask(userId: string, dto: CreateTaskDto) {
    const { project } = await this.checkProjectAccess(dto.projectId, userId, [
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
    ]);

    const targetIdOrStatus = dto.columnId || (dto.status as string);

    let targetColumnId: string | null = null;
    let targetStatus: TaskStatus = TaskStatus.TODO;

    if (targetIdOrStatus) {
      const column = await this.findProjectColumn(dto.projectId, targetIdOrStatus);

      if (column) {
        targetColumnId = column.id;
        targetStatus = column.status;
      } else if (Object.values(TaskStatus).includes(targetIdOrStatus as TaskStatus)) {
        targetStatus = targetIdOrStatus as TaskStatus;
        targetColumnId = null;
      } else if (dto.status && Object.values(TaskStatus).includes(dto.status)) {
        targetStatus = dto.status;
        targetColumnId = null;
      } else {
        throw new BadRequestException('Cột Kanban hoặc trạng thái không hợp lệ.');
      }
    } else if (dto.status) {
      targetStatus = dto.status;
    }

    // Nếu có gán người thực hiện, kiểm tra xem người đó có thuộc Workspace không
    if (dto.assigneeId) {
      const assigneeMember = await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: project.workspaceId,
            userId: dto.assigneeId,
          },
        },
      });
      if (!assigneeMember) {
        throw new BadRequestException('Người thực hiện không thuộc không gian làm việc này.');
      }
    }

    // Tính toán position: Lấy position lớn nhất trong project + 65535.0
    const lastTask = await this.prisma.task.findFirst({
      where: { projectId: dto.projectId, deletedAt: null },
      orderBy: { position: 'desc' },
    });

    const position = lastTask ? lastTask.position + 65535.0 : 65535.0;

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: targetStatus,
        priority: dto.priority || TaskPriority.MEDIUM,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        position,
        projectId: dto.projectId,
        columnId: targetColumnId,
        reporterId: userId,
        assigneeId: dto.assigneeId || null,
      },
      include: {
        assignee: { select: { id: true, fullname: true, email: true, avatar: true } },
        reporter: { select: { id: true, fullname: true, email: true, avatar: true } },
      },
    });

    // Phát sự kiện realtime
    this.taskGateway.emitToProject(task.projectId, 'task:created', task);

    // Phát sự kiện thông báo nếu có người thực hiện
    if (task.assigneeId) {
      this.eventEmitter.emit(
        'task.assigned',
        new TaskAssignedEvent(
          task.assigneeId,
          'Bạn đã được phân công công việc mới',
          `Bạn đã được giao công việc "${task.title}" trong dự án "${project.name}".`,
          `/project/${task.projectId}?taskId=${task.id}`,
          project.workspaceId,
        ),
      );
    }

    // Phát event để ghi nhận Activity Log
    this.eventEmitter.emit('task.created', {
      task,
      workspaceId: project.workspaceId,
      userId,
    });

    return task;
  }

  async findAllTasksForProject(projectId: string, userId: string, filters: any) {
    await this.checkProjectAccess(projectId, userId);

    const where: any = {
      projectId,
      deletedAt: null,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.columnId) {
      where.columnId = filters.columnId;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    if (filters.search) {
      where.title = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    if (filters.labelId) {
      where.labels = {
        some: {
          labelId: filters.labelId,
        },
      };
    }

    return this.prisma.task.findMany({
      where,
      orderBy: {
        position: 'asc',
      },
      include: {
        assignee: { select: { id: true, fullname: true, avatar: true } },
        labels: {
          include: {
            label: true,
          },
        },
        _count: {
          select: {
            comments: true,
            checklists: true,
          },
        },
      },
    });
  }

  async findTaskById(id: string, userId: string) {
    await this.checkTaskAccess(id, userId);

    return this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, fullname: true, email: true, avatar: true } },
        reporter: { select: { id: true, fullname: true, email: true, avatar: true } },
        column: true,
        project: true,
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, fullname: true, avatar: true } },
          },
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
          include: {
            uploadedBy: { select: { id: true, fullname: true } },
          },
        },
        checklists: {
          orderBy: { position: 'asc' },
          include: {
            items: {
              orderBy: { position: 'asc' },
            },
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
      },
    });
  }

  async updateTask(id: string, userId: string, dto: UpdateTaskDto) {
    const { task, project, membership } = await this.checkTaskAccess(id, userId);

    const isOwnerOrAdmin =
      membership.role === WorkspaceRole.OWNER || membership.role === WorkspaceRole.ADMIN;

    if (!isOwnerOrAdmin) {
      const isUpdatingOtherFields =
        (dto.title !== undefined && dto.title !== task.title) ||
        (dto.description !== undefined && dto.description !== task.description) ||
        (dto.priority !== undefined && dto.priority !== task.priority) ||
        dto.dueDate !== undefined ||
        (dto.assigneeId !== undefined && dto.assigneeId !== task.assigneeId);

      if (isUpdatingOtherFields) {
        throw new ForbiddenException('Thành viên chỉ được phép cập nhật trạng thái của công việc.');
      }
    }

    const data: any = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.dueDate !== undefined) data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;

    if (dto.assigneeId !== undefined) {
      if (dto.assigneeId) {
        const assigneeMember = await this.prisma.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId: project.workspaceId,
              userId: dto.assigneeId,
            },
          },
        });
        if (!assigneeMember) {
          throw new BadRequestException('Người thực hiện không thuộc không gian làm việc này.');
        }
        data.assigneeId = dto.assigneeId;
      } else {
        data.assigneeId = null;
      }
    }

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: { select: { id: true, fullname: true, avatar: true } },
      },
    });

    // Phát sự kiện realtime
    this.taskGateway.emitToProject(updatedTask.projectId, 'task:updated', updatedTask);

    // Phát sự kiện thông báo nếu đổi người thực hiện
    if (dto.assigneeId && dto.assigneeId !== task.assigneeId) {
      this.eventEmitter.emit(
        'task.assigned',
        new TaskAssignedEvent(
          dto.assigneeId,
          'Bạn đã được phân công công việc mới',
          `Bạn đã được giao công việc "${updatedTask.title}" trong dự án "${project.name}".`,
          `/project/${updatedTask.projectId}?taskId=${updatedTask.id}`,
          project.workspaceId,
        ),
      );
    }

    // Tính toán các trường thay đổi để ghi log
    const changes: any = {};
    if (dto.title !== undefined && dto.title !== task.title) changes.title = { old: task.title, new: dto.title };
    if (dto.description !== undefined && dto.description !== task.description) changes.description = { old: task.description, new: dto.description };
    if (dto.priority !== undefined && dto.priority !== task.priority) changes.priority = { old: task.priority, new: dto.priority };
    if (dto.status !== undefined && dto.status !== task.status) changes.status = { old: task.status, new: dto.status };
    if (dto.dueDate !== undefined) {
      const oldTime = task.dueDate ? new Date(task.dueDate).getTime() : null;
      const newTime = dto.dueDate ? new Date(dto.dueDate).getTime() : null;
      if (oldTime !== newTime) {
        changes.dueDate = { old: task.dueDate, new: dto.dueDate ? new Date(dto.dueDate) : null };
      }
    }
    if (dto.assigneeId !== undefined && dto.assigneeId !== task.assigneeId) {
      changes.assigneeId = { old: task.assigneeId, new: dto.assigneeId || null };
    }

    if (Object.keys(changes).length > 0) {
      this.eventEmitter.emit('task.updated', {
        task: updatedTask,
        workspaceId: project.workspaceId,
        userId,
        changes,
      });
    }

    return updatedTask;
  }

  async softDeleteTask(id: string, userId: string) {
    const { task, project } = await this.checkTaskAccess(id, userId, [
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
    ]);

    await this.prisma.task.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Phát sự kiện realtime
    this.taskGateway.emitToProject(task.projectId, 'task:deleted', { taskId: id });

    // Phát event để ghi nhận Activity Log
    this.eventEmitter.emit('task.deleted', {
      taskId: id,
      taskTitle: task.title,
      projectId: task.projectId,
      workspaceId: project.workspaceId,
      userId,
    });

    return { message: 'Đã xóa công việc thành công.' };
  }

  async moveTask(id: string, userId: string, dto: MoveTaskDto) {
    const { task, project } = await this.checkTaskAccess(id, userId);

    const targetIdOrStatus = dto.columnId || (dto.status as string);
    if (!targetIdOrStatus) {
      throw new BadRequestException('Phải cung cấp cột hoặc trạng thái đích.');
    }

    const column = await this.findProjectColumn(task.projectId, targetIdOrStatus);

    let newStatus: TaskStatus;
    let newColumnId: string | null = null;

    if (column) {
      newColumnId = column.id;
      newStatus = column.status;
    } else {
      const validStatuses = Object.values(TaskStatus);
      if (validStatuses.includes(targetIdOrStatus as TaskStatus)) {
        newStatus = targetIdOrStatus as TaskStatus;
        newColumnId = null;
      } else if (dto.status && validStatuses.includes(dto.status)) {
        newStatus = dto.status;
        newColumnId = null;
      } else {
        throw new BadRequestException('Cột Kanban hoặc trạng thái đích không hợp lệ.');
      }
    }

    const oldColumn = task.columnId
      ? await this.prisma.projectColumn.findUnique({ where: { id: task.columnId } })
      : null;

    const movedTask = await this.prisma.task.update({
      where: { id },
      data: {
        columnId: newColumnId,
        position: dto.position,
        status: newStatus,
      },
    });

    // Phát sự kiện realtime
    this.taskGateway.emitToProject(movedTask.projectId, 'task:moved', movedTask);

    // Phát event để ghi nhận Activity Log
    this.eventEmitter.emit('task.moved', {
      task: movedTask,
      oldColumnName: oldColumn?.name || 'Không rõ',
      newColumnName: column?.name || newStatus,
      workspaceId: project.workspaceId,
      userId,
    });

    return movedTask;
  }

  // ==========================================
  // SECTION 2: KANBAN COLUMNS CRUD
  // ==========================================

  async findColumnsForProject(projectId: string, userId: string) {
    await this.checkProjectAccess(projectId, userId);

    return this.prisma.projectColumn.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
    });
  }

  async createColumn(projectId: string, userId: string, name: string, status?: TaskStatus) {
    await this.checkProjectAccess(projectId, userId, [WorkspaceRole.OWNER, WorkspaceRole.ADMIN]);

    // Trùng tên cột trong dự án
    const existing = await this.prisma.projectColumn.findFirst({
      where: { projectId, name },
    });

    if (existing) {
      throw new ConflictException('Cột Kanban với tên này đã tồn tại trong dự án.');
    }

    const lastCol = await this.prisma.projectColumn.findFirst({
      where: { projectId },
      orderBy: { position: 'desc' },
    });

    const position = lastCol ? lastCol.position + 1000.0 : 1000.0;

    const column = await this.prisma.projectColumn.create({
      data: {
        name,
        position,
        status: status || TaskStatus.TODO,
        projectId,
      },
    });

    // Phát sự kiện realtime
    this.taskGateway.emitToProject(projectId, 'column:created', column);

    return column;
  }

  async updateColumn(id: string, userId: string, name?: string, position?: number) {
    const col = await this.prisma.projectColumn.findUnique({
      where: { id },
    });

    if (!col) {
      throw new NotFoundException('Cột Kanban không tồn tại.');
    }

    await this.checkProjectAccess(col.projectId, userId, [WorkspaceRole.OWNER, WorkspaceRole.ADMIN]);

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (position !== undefined) data.position = position;

    const updatedCol = await this.prisma.projectColumn.update({
      where: { id },
      data,
    });

    // Phát sự kiện realtime
    this.taskGateway.emitToProject(updatedCol.projectId, 'column:updated', updatedCol);

    return updatedCol;
  }

  async deleteColumn(id: string, userId: string) {
    const col = await this.prisma.projectColumn.findUnique({
      where: { id },
    });

    if (!col) {
      throw new NotFoundException('Cột Kanban không tồn tại.');
    }

    await this.checkProjectAccess(col.projectId, userId, [WorkspaceRole.OWNER, WorkspaceRole.ADMIN]);

    // Ràng buộc RESTRICT: Kiểm tra xem cột còn task không
    const tasksCount = await this.prisma.task.count({
      where: { columnId: id, deletedAt: null },
    });

    if (tasksCount > 0) {
      throw new BadRequestException('Không thể xóa cột Kanban đang chứa công việc. Vui lòng di chuyển các công việc đi nơi khác trước.');
    }

    await this.prisma.projectColumn.delete({
      where: { id },
    });

    // Phát sự kiện realtime
    this.taskGateway.emitToProject(col.projectId, 'column:deleted', { columnId: id });

    return { message: 'Đã xóa cột thành công.' };
  }

  // ==========================================
  // SECTION 3: WORKSPACE LABELS & TASK ASSIGNMENT
  // ==========================================

  async findLabelsForWorkspace(workspaceId: string, userId: string) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });

    if (!membership) {
      throw new ForbiddenException('Bạn không thuộc không gian làm việc này.');
    }

    return this.prisma.taskLabel.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLabel(workspaceId: string, userId: string, dto: CreateLabelDto) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });

    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      throw new ForbiddenException('Chỉ có quản trị viên mới được tạo nhãn.');
    }

    // Trùng tên label trong workspace
    const existing = await this.prisma.taskLabel.findFirst({
      where: { workspaceId, name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Tên nhãn đã tồn tại trong không gian làm việc.');
    }

    return this.prisma.taskLabel.create({
      data: {
        name: dto.name,
        color: dto.color,
        workspaceId,
      },
    });
  }

  async deleteLabel(id: string, userId: string) {
    const label = await this.prisma.taskLabel.findUnique({
      where: { id },
    });

    if (!label) {
      throw new NotFoundException('Nhãn không tồn tại.');
    }

    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: label.workspaceId,
          userId,
        },
      },
    });

    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      throw new ForbiddenException('Chỉ có quản trị viên mới được xóa nhãn.');
    }

    await this.prisma.taskLabel.delete({
      where: { id },
    });

    return { message: 'Đã xóa nhãn thành công.' };
  }

  async assignLabelsToTask(taskId: string, userId: string, labelIds: string[]) {
    const { task } = await this.checkTaskAccess(taskId, userId);

    return this.prisma.$transaction(async (tx) => {
      // Xóa các liên kết nhãn cũ
      await tx.taskLabelRelation.deleteMany({
        where: { taskId },
      });

      // Tạo liên kết nhãn mới
      if (labelIds.length > 0) {
        await Promise.all(
          labelIds.map((labelId) =>
            tx.taskLabelRelation.create({
              data: {
                taskId,
                labelId,
              },
            }),
          ),
        );
      }

      const relations = await tx.taskLabelRelation.findMany({
        where: { taskId },
        include: { label: true },
      });

      // Phát sự kiện realtime
      this.taskGateway.emitToProject(task.projectId, 'task:updated', { id: taskId, labels: relations });

      return relations;
    });
  }

  // ==========================================
  // SECTION 4: CHECKLISTS & ITEMS
  // ==========================================

  async createChecklist(taskId: string, userId: string, title: string) {
    const { task } = await this.checkTaskAccess(taskId, userId);

    const lastChecklist = await this.prisma.checklist.findFirst({
      where: { taskId },
      orderBy: { position: 'desc' },
    });

    const position = lastChecklist ? lastChecklist.position + 1000.0 : 1000.0;

    const checklist = await this.prisma.checklist.create({
      data: {
        title,
        position,
        taskId,
      },
    });

    // Phát sự kiện realtime
    this.taskGateway.emitToProject(task.projectId, 'task:updated', { id: taskId });

    return checklist;
  }

  async deleteChecklist(id: string, userId: string) {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id },
    });

    if (!checklist) {
      throw new NotFoundException('Checklist không tồn tại.');
    }

    const { task } = await this.checkTaskAccess(checklist.taskId, userId);

    await this.prisma.checklist.delete({
      where: { id },
    });

    // Phát sự kiện realtime
    this.taskGateway.emitToProject(task.projectId, 'task:updated', { id: checklist.taskId });

    return { message: 'Đã xóa checklist thành công.' };
  }

  async createChecklistItem(checklistId: string, userId: string, title: string) {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id: checklistId },
    });

    if (!checklist) {
      throw new NotFoundException('Checklist không tồn tại.');
    }

    const { task } = await this.checkTaskAccess(checklist.taskId, userId);

    const lastItem = await this.prisma.checklistItem.findFirst({
      where: { checklistId },
      orderBy: { position: 'desc' },
    });

    const position = lastItem ? lastItem.position + 1000.0 : 1000.0;

    const item = await this.prisma.checklistItem.create({
      data: {
        title,
        position,
        checklistId,
      },
    });

    // Phát sự kiện realtime
    this.taskGateway.emitToProject(task.projectId, 'task:updated', { id: checklist.taskId });

    return item;
  }

  async toggleChecklistItem(id: string, userId: string, isCompleted: boolean, title?: string) {
    const item = await this.prisma.checklistItem.findUnique({
      where: { id },
      include: { checklist: true },
    });

    if (!item) {
      throw new NotFoundException('Mục checklist không tồn tại.');
    }

    const { task } = await this.checkTaskAccess(item.checklist.taskId, userId);

    const data: any = { isCompleted };
    if (title !== undefined) data.title = title;

    const updatedItem = await this.prisma.checklistItem.update({
      where: { id },
      data,
    });

    // Phát sự kiện realtime
    this.taskGateway.emitToProject(task.projectId, 'task:updated', { id: item.checklist.taskId });

    return updatedItem;
  }

  async deleteChecklistItem(id: string, userId: string) {
    const item = await this.prisma.checklistItem.findUnique({
      where: { id },
      include: { checklist: true },
    });

    if (!item) {
      throw new NotFoundException('Mục checklist không tồn tại.');
    }

    const { task } = await this.checkTaskAccess(item.checklist.taskId, userId);

    await this.prisma.checklistItem.delete({
      where: { id },
    });

    // Phát sự kiện realtime
    this.taskGateway.emitToProject(task.projectId, 'task:updated', { id: item.checklist.taskId });

    return { message: 'Đã xóa mục checklist thành công.' };
  }

  // ==========================================
  // SECTION 5: COMMENTS & ATTACHMENTS
  // ==========================================

  async createComment(taskId: string, userId: string, dto: CreateCommentDto) {
    const { task, project } = await this.checkTaskAccess(taskId, userId);

    const comment = await this.prisma.comment.create({
      data: {
        content: dto.content,
        taskId,
        userId,
      },
      include: {
        user: { select: { id: true, fullname: true, avatar: true } },
      },
    });

    // Phát sự kiện realtime
    this.taskGateway.emitToProject(task.projectId, 'comment:created', comment);

    // Gửi thông báo cho assignee (nếu có và không phải người comment)
    if (task.assigneeId && task.assigneeId !== userId) {
      this.eventEmitter.emit(
        'task.commented',
        new TaskCommentEvent(
          task.assigneeId,
          'Có bình luận mới trong công việc',
          `Người dùng ${comment.user.fullname} đã bình luận trong công việc "${task.title}": "${dto.content.substring(0, 50)}..."`,
          `/project/${task.projectId}?taskId=${task.id}`,
          project.workspaceId,
        ),
      );
    }

    // Gửi thông báo cho reporter (nếu không phải người comment và khác assignee)
    if (task.reporterId !== userId && task.reporterId !== task.assigneeId) {
      this.eventEmitter.emit(
        'task.commented',
        new TaskCommentEvent(
          task.reporterId,
          'Có bình luận mới trong công việc',
          `Người dùng ${comment.user.fullname} đã bình luận trong công việc "${task.title}": "${dto.content.substring(0, 50)}..."`,
          `/project/${task.projectId}?taskId=${task.id}`,
          project.workspaceId,
        ),
      );
    }

    // Emit event để ghi nhận Activity Log
    this.eventEmitter.emit('comment.created', {
      comment,
      taskId,
      taskTitle: task.title,
      projectId: task.projectId,
      workspaceId: project.workspaceId,
      userId,
    });

    return comment;
  }

  async deleteComment(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: { task: true },
    });

    if (!comment) {
      throw new NotFoundException('Bình luận không tồn tại.');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('Bạn không được quyền xóa bình luận của người khác.');
    }

    await this.prisma.comment.delete({
      where: { id },
    });

    // Phát sự kiện realtime
    this.taskGateway.emitToProject(comment.task.projectId, 'comment:deleted', { commentId: id, taskId: comment.taskId });

    return { message: 'Đã xóa bình luận thành công.' };
  }

  // Attachments
  async createAttachment(taskId: string, userId: string, metadata: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    storagePath: string;
    publicUrl: string;
  }) {
    const { task } = await this.checkTaskAccess(taskId, userId);

    const attachment = await this.prisma.attachment.create({
      data: {
        fileName: metadata.fileName,
        fileSize: metadata.fileSize,
        mimeType: metadata.mimeType,
        storagePath: metadata.storagePath,
        publicUrl: metadata.publicUrl,
        taskId,
        uploadedById: userId,
      },
    });

    // Phát sự kiện realtime
    this.taskGateway.emitToProject(task.projectId, 'attachment:created', attachment);

    return attachment;
  }

  async deleteAttachment(id: string, userId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException('File đính kèm không tồn tại.');
    }

    const { task } = await this.checkTaskAccess(attachment.taskId, userId);

    await this.prisma.attachment.delete({
      where: { id },
    });

    // Phát sự kiện realtime
    this.taskGateway.emitToProject(task.projectId, 'attachment:deleted', { attachmentId: id, taskId: attachment.taskId });

    return { message: 'Đã xóa file đính kèm thành công.', storagePath: attachment.storagePath };
  }
}
