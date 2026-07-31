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
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // 1. Tạo mới Project
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: User, @Body() dto: CreateProjectDto) {
    return this.projectService.create(user.id, dto);
  }

  // 2. Lấy danh sách Project trong Workspace
  @Get('workspace/:workspaceId')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
  ) {
    return this.projectService.findAllForWorkspace(workspaceId, user.id);
  }

  // 3. Lấy thông tin chi tiết Project
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectService.findOne(id, user.id);
  }

  // 4. Cập nhật thông tin Project
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectService.update(id, user.id, dto);
  }

  // 5. Xóa Project (soft delete)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectService.softDelete(id, user.id);
  }
}
