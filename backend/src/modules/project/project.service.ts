import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  // 1. Tạo mới Project và tự động sinh 4 cột Kanban mặc định
  async create(userId: string, dto: CreateProjectDto) {
    // Kiểm tra xem User có thuộc về Workspace này không
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: dto.workspaceId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'Bạn không có quyền tạo dự án trong không gian làm việc này.',
      );
    }

    const cleanKey = dto.key.toUpperCase().trim();

    // Kiểm tra trùng key trong cùng workspace
    const existingProject = await this.prisma.project.findFirst({
      where: {
        workspaceId: dto.workspaceId,
        key: cleanKey,
        deletedAt: null,
      },
    });

    if (existingProject) {
      throw new ConflictException(
        'Mã dự án (key) đã tồn tại trong không gian làm việc này.',
      );
    }

    // Chạy transaction tạo Project và 4 cột Kanban mặc định
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: dto.name,
          key: cleanKey,
          description: dto.description,
          workspaceId: dto.workspaceId,
        },
      });

      // Tạo các cột Kanban mặc định
      const defaultColumns = [
        { name: 'Cần làm', position: 1000.0, status: TaskStatus.TODO },
        { name: 'Đang tiến hành', position: 2000.0, status: TaskStatus.IN_PROGRESS },
        { name: 'Đang duyệt', position: 3000.0, status: TaskStatus.IN_REVIEW },
        { name: 'Hoàn thành', position: 4000.0, status: TaskStatus.DONE },
      ];

      await Promise.all(
        defaultColumns.map((col) =>
          tx.projectColumn.create({
            data: {
              name: col.name,
              position: col.position,
              status: col.status,
              projectId: project.id,
            },
          }),
        ),
      );

      return project;
    });
  }

  // 2. Lấy danh sách các Project trong 1 Workspace
  async findAllForWorkspace(workspaceId: string, userId: string) {
    // Xác thực quyền truy cập Workspace
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Bạn không thuộc về không gian làm việc này.');
    }

    return this.prisma.project.findMany({
      where: {
        workspaceId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // 3. Lấy chi tiết Project kèm theo các Column
  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new NotFoundException('Dự án không tồn tại hoặc đã bị xóa.');
    }

    // Kiểm tra quyền
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

    return this.prisma.project.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });
  }

  // 4. Cập nhật Project
  async update(id: string, userId: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new NotFoundException('Dự án không tồn tại hoặc đã bị xóa.');
    }

    // Kiểm tra quyền
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: project.workspaceId,
          userId,
        },
      },
    });

    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      throw new ForbiddenException('Chỉ có quản trị viên mới được cập nhật dự án.');
    }

    return this.prisma.project.update({
      where: { id },
      data: dto,
    });
  }

  // 5. Soft delete Project
  async softDelete(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new NotFoundException('Dự án không tồn tại hoặc đã bị xóa.');
    }

    // Kiểm tra quyền
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: project.workspaceId,
          userId,
        },
      },
    });

    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      throw new ForbiddenException('Chỉ có quản trị viên mới được xóa dự án.');
    }

    await this.prisma.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'Đã xóa dự án thành công.' };
  }
}
