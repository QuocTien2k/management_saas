import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceRole, MemberStatus } from '@prisma/client';

@Injectable()
export class WorkspaceService {
  constructor(private prisma: PrismaService) {}

  // Helper để tạo slug chuẩn từ tên tiếng Việt
  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu thanh
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9 -]/g, '') // Loại bỏ ký tự đặc biệt
      .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
      .replace(/-+/g, '-') // Gom nhiều dấu gạch ngang liên tiếp
      .trim();
  }

  // 1. Tạo mới Workspace
  async create(userId: string, dto: CreateWorkspaceDto) {
    let slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);

    if (!slug) {
      slug = `workspace-${Date.now()}`;
    }

    // Kiểm tra trùng lặp slug
    const existingWorkspace = await this.prisma.workspace.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
    });

    if (existingWorkspace) {
      if (dto.slug) {
        throw new ConflictException(
          'Địa chỉ không gian làm việc (slug) đã tồn tại. Vui lòng chọn địa chỉ khác.',
        );
      }
      // Nếu là tự động tạo từ tên, tự động thêm hậu tố số ngẫu nhiên
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Chạy transaction để tạo đồng thời Workspace và thiết lập Owner
    return this.prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: dto.name,
          slug,
          description: dto.description,
          logo: dto.logo,
        },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId,
          role: WorkspaceRole.OWNER,
          status: MemberStatus.ACTIVE,
          joinedAt: new Date(),
        },
      });

      return workspace;
    });
  }

  // 2. Lấy danh sách workspace người dùng tham gia
  async findAllForUser(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: {
        userId,
        status: MemberStatus.ACTIVE,
        workspace: {
          deletedAt: null,
        },
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            description: true,
            createdAt: true,
            _count: {
              select: {
                members: {
                  where: {
                    status: MemberStatus.ACTIVE,
                  },
                },
                projects: {
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  // 3. Lấy thông tin chi tiết Workspace
  async findOne(id: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            members: {
              where: {
                status: MemberStatus.ACTIVE,
              },
            },
            projects: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException(
        'Không gian làm việc không tồn tại hoặc đã bị xóa',
      );
    }

    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      logo: workspace.logo,
      description: workspace.description,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      memberCount: workspace._count.members,
      _count: {
        members: workspace._count.members,
        projects: workspace._count.projects,
      },
    };
  }

  // 4. Cập nhật thông tin Workspace
  async update(id: string, dto: UpdateWorkspaceDto) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!workspace) {
      throw new NotFoundException(
        'Không gian làm việc không tồn tại hoặc đã bị xóa',
      );
    }

    const data: Partial<UpdateWorkspaceDto> = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.logo !== undefined) data.logo = dto.logo;

    if (dto.slug !== undefined && dto.slug !== workspace.slug) {
      const cleanSlug = this.slugify(dto.slug);

      const existing = await this.prisma.workspace.findFirst({
        where: {
          slug: cleanSlug,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existing) {
        throw new ConflictException(
          'Địa chỉ không gian làm việc (slug) đã tồn tại. Vui lòng chọn địa chỉ khác.',
        );
      }
      data.slug = cleanSlug;
    }

    return this.prisma.workspace.update({
      where: { id },
      data,
    });
  }

  // 5. Soft delete Workspace
  async softDelete(id: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!workspace) {
      throw new NotFoundException(
        'Không gian làm việc không tồn tại hoặc đã bị xóa',
      );
    }

    await this.prisma.workspace.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'Đã xóa không gian làm việc thành công' };
  }
}
