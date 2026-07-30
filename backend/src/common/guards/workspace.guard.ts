import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkspaceRole, MemberStatus } from '@prisma/client';
import { WORKSPACE_ROLES_KEY } from '../decorators/workspace-roles.decorator';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Yêu cầu xác thực tài khoản');
    }

    // Lấy workspaceId từ Header, Query hoặc Route Params
    let workspaceId = request.headers['x-workspace-id'] as string;

    if (!workspaceId) {
      workspaceId = request.params.workspaceId || request.params.id;
    }

    if (!workspaceId) {
      throw new BadRequestException(
        'Thiếu thông tin ID không gian làm việc (x-workspace-id)',
      );
    }

    // Kiểm tra không gian làm việc tồn tại và chưa bị soft-delete
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, deletedAt: true },
    });

    if (!workspace || workspace.deletedAt) {
      throw new ForbiddenException(
        'Không gian làm việc không tồn tại hoặc đã bị xóa',
      );
    }

    // Kiểm tra tư cách thành viên trong workspace
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    if (!member || member.status !== MemberStatus.ACTIVE) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập không gian làm việc này',
      );
    }

    // Kiểm tra quyền (Workspace Role) yêu cầu từ Decorator
    const requiredRoles = this.reflector.getAllAndOverride<WorkspaceRole[]>(
      WORKSPACE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.includes(member.role);
      if (!hasRole) {
        throw new ForbiddenException(
          'Tài khoản của bạn không có vai trò phù hợp trong không gian làm việc để thực hiện hành động này',
        );
      }
    }

    // Gắn thông tin member vào request để sử dụng ở Controller/Service nếu cần
    request.workspaceMember = member;
    request.workspaceId = workspaceId;

    return true;
  }
}
