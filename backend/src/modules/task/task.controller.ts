import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateLabelDto } from './dto/create-label.dto';
import { TaskAttachmentInputDto } from './dto/task-attachment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TaskStatus, TaskPriority } from '@prisma/client';
import type { User } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // ==========================================
  // SECTION 1: TASK CRUD & MOVE
  // ==========================================

  @Post('tasks')
  @HttpCode(HttpStatus.CREATED)
  async createTask(@CurrentUser() user: User, @Body() dto: CreateTaskDto) {
    return this.taskService.createTask(user.id, dto);
  }

  @Get('tasks/project/:projectId')
  @HttpCode(HttpStatus.OK)
  async findAllTasks(
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
    @Query('status') status?: TaskStatus,
    @Query('columnId') columnId?: string,
    @Query('priority') priority?: TaskPriority,
    @Query('assigneeId') assigneeId?: string,
    @Query('search') search?: string,
    @Query('labelId') labelId?: string,
  ) {
    return this.taskService.findAllTasksForProject(projectId, user.id, {
      status,
      columnId,
      priority,
      assigneeId,
      search,
      labelId,
    });
  }

  @Get('tasks/:id')
  @HttpCode(HttpStatus.OK)
  async findTaskById(@Param('id') id: string, @CurrentUser() user: User) {
    return this.taskService.findTaskById(id, user.id);
  }

  @Patch('tasks/:id')
  @HttpCode(HttpStatus.OK)
  async updateTask(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.taskService.updateTask(id, user.id, dto);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.OK)
  async removeTask(@Param('id') id: string, @CurrentUser() user: User) {
    return this.taskService.softDeleteTask(id, user.id);
  }

  @Patch('tasks/:id/move')
  @HttpCode(HttpStatus.OK)
  async moveTask(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: MoveTaskDto,
  ) {
    return this.taskService.moveTask(id, user.id, dto);
  }

  // ==========================================
  // SECTION 2: KANBAN COLUMNS CRUD
  // ==========================================

  @Get('projects/:projectId/columns')
  @HttpCode(HttpStatus.OK)
  async findColumns(
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
  ) {
    return this.taskService.findColumnsForProject(projectId, user.id);
  }

  @Post('projects/:projectId/columns')
  @HttpCode(HttpStatus.CREATED)
  async createColumn(
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
    @Body('name') name: string,
    @Body('status') status?: TaskStatus,
  ) {
    return this.taskService.createColumn(projectId, user.id, name, status);
  }

  @Patch('columns/:id')
  @HttpCode(HttpStatus.OK)
  async updateColumn(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('name') name?: string,
    @Body('position') position?: number,
  ) {
    return this.taskService.updateColumn(id, user.id, name, position);
  }

  @Delete('columns/:id')
  @HttpCode(HttpStatus.OK)
  async removeColumn(@Param('id') id: string, @CurrentUser() user: User) {
    return this.taskService.deleteColumn(id, user.id);
  }

  // ==========================================
  // SECTION 3: WORKSPACE LABELS & TASK ASSIGNMENT
  // ==========================================

  @Get('workspaces/:workspaceId/labels')
  @HttpCode(HttpStatus.OK)
  async findLabels(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
  ) {
    return this.taskService.findLabelsForWorkspace(workspaceId, user.id);
  }

  @Post('workspaces/:workspaceId/labels')
  @HttpCode(HttpStatus.CREATED)
  async createLabel(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateLabelDto,
  ) {
    return this.taskService.createLabel(workspaceId, user.id, dto);
  }

  @Delete('labels/:id')
  @HttpCode(HttpStatus.OK)
  async removeLabel(@Param('id') id: string, @CurrentUser() user: User) {
    return this.taskService.deleteLabel(id, user.id);
  }

  @Post('tasks/:id/labels')
  @HttpCode(HttpStatus.OK)
  async assignLabels(
    @Param('id') taskId: string,
    @CurrentUser() user: User,
    @Body('labelIds') labelIds: string[],
  ) {
    return this.taskService.assignLabelsToTask(taskId, user.id, labelIds);
  }

  // ==========================================
  // SECTION 4: CHECKLISTS & ITEMS
  // ==========================================

  @Post('tasks/:taskId/checklists')
  @HttpCode(HttpStatus.CREATED)
  async createChecklist(
    @Param('taskId') taskId: string,
    @CurrentUser() user: User,
    @Body('title') title: string,
  ) {
    return this.taskService.createChecklist(taskId, user.id, title);
  }

  @Delete('checklists/:id')
  @HttpCode(HttpStatus.OK)
  async removeChecklist(@Param('id') id: string, @CurrentUser() user: User) {
    return this.taskService.deleteChecklist(id, user.id);
  }

  @Post('checklists/:checklistId/items')
  @HttpCode(HttpStatus.CREATED)
  async createChecklistItem(
    @Param('checklistId') checklistId: string,
    @CurrentUser() user: User,
    @Body('title') title: string,
  ) {
    return this.taskService.createChecklistItem(checklistId, user.id, title);
  }

  @Patch('checklist-items/:id')
  @HttpCode(HttpStatus.OK)
  async toggleChecklistItem(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('isCompleted') isCompleted: boolean,
    @Body('title') title?: string,
  ) {
    return this.taskService.toggleChecklistItem(id, user.id, isCompleted, title);
  }

  @Delete('checklist-items/:id')
  @HttpCode(HttpStatus.OK)
  async removeChecklistItem(@Param('id') id: string, @CurrentUser() user: User) {
    return this.taskService.deleteChecklistItem(id, user.id);
  }

  // ==========================================
  // SECTION 5: COMMENTS & ATTACHMENTS
  // ==========================================

  @Get('tasks/:taskId/comments')
  @HttpCode(HttpStatus.OK)
  async findComments(
    @Param('taskId') taskId: string,
    @CurrentUser() user: User,
  ) {
    return this.taskService.findCommentsForTask(taskId, user.id);
  }

  @Post('tasks/:taskId/comments')
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Param('taskId') taskId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateCommentDto,
  ) {
    return this.taskService.createComment(taskId, user.id, dto);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.OK)
  async removeComment(@Param('id') id: string, @CurrentUser() user: User) {
    return this.taskService.deleteComment(id, user.id);
  }

  @Post('tasks/:taskId/attachments')
  @HttpCode(HttpStatus.CREATED)
  async createAttachment(
    @Param('taskId') taskId: string,
    @CurrentUser() user: User,
    @Body() dto: TaskAttachmentInputDto,
  ) {
    return this.taskService.createAttachment(taskId, user.id, dto);
  }

  @Delete('attachments/:id')
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('id') id: string, @CurrentUser() user: User) {
    return this.taskService.deleteAttachment(id, user.id);
  }
}
