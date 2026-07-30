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
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { WorkspaceRoles } from '../../common/decorators/workspace-roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WorkspaceRole } from '@prisma/client';
import type { User } from '@prisma/client';

@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  // 1. Tạo mới Workspace
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: User, @Body() dto: CreateWorkspaceDto) {
    return this.workspaceService.create(user.id, dto);
  }

  // 2. Lấy danh sách Workspace người dùng thuộc về
  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findAll(@CurrentUser() user: User) {
    return this.workspaceService.findAllForUser(user.id);
  }

  // 3. Lấy chi tiết Workspace
  @Get(':id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.workspaceService.findOne(id);
  }

  // 4. Cập nhật thông tin Workspace (chỉ OWNER và ADMIN)
  @Patch(':id')
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateWorkspaceDto) {
    return this.workspaceService.update(id, dto);
  }

  // 5. Xóa Workspace (chỉ OWNER)
  @Delete(':id')
  @WorkspaceRoles(WorkspaceRole.OWNER)
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.workspaceService.softDelete(id);
  }
}
