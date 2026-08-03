import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { WorkspaceRole, MemberStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MemberInvitedEvent } from '../notification/events/notification.events';
import * as crypto from 'crypto';

@Injectable()
export class MemberService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private eventEmitter: EventEmitter2,
  ) {}

  // 1. Lấy danh sách thành viên trong Workspace
  async listMembers(workspaceId: string) {
    return this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
        status: MemberStatus.ACTIVE,
      },
      select: {
        id: true,
        workspaceId: true,
        userId: true,
        role: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });
  }

  // 2. Gửi lời mời tham gia Workspace
  async inviteMember(
    workspaceId: string,
    currentUserId: string,
    dto: InviteMemberDto,
  ) {
    const workspace = await this.prisma.workspace.findFirst({
      where: { id: workspaceId, deletedAt: null },
    });

    if (!workspace) {
      throw new NotFoundException(
        'Không gian làm việc không tồn tại hoặc đã bị xóa',
      );
    }

    const inviter = await this.prisma.user.findUnique({
      where: { id: currentUserId },
    });

    // 1. Kiểm tra xem người dùng đã là thành viên của Workspace chưa
    const targetUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (targetUser) {
      const existingMember = await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: targetUser.id,
          },
        },
      });

      if (existingMember) {
        if (existingMember.status === MemberStatus.ACTIVE) {
          throw new BadRequestException(
            'Người dùng đã là thành viên hoạt động của không gian làm việc này',
          );
        } else if (existingMember.status === MemberStatus.SUSPENDED) {
          throw new BadRequestException(
            'Thành viên này đã bị đình chỉ và không thể mời lại trực tiếp',
          );
        }
      }
    }

    // 2. Xóa lời mời cũ (nếu có) để tránh xung đột
    await this.prisma.workspaceInvitation.deleteMany({
      where: {
        workspaceId,
        email: dto.email,
      },
    });

    // 3. Tạo lời mời mới
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Hết hạn sau 7 ngày

    const invitation = await this.prisma.workspaceInvitation.create({
      data: {
        email: dto.email,
        workspaceId,
        role: dto.role,
        token,
        invitedById: currentUserId,
        expiresAt,
      },
    });

    // 4. Gửi email
    const mailSent = await this.mailService.sendWorkspaceInvitationEmail(
      dto.email,
      workspace.name,
      inviter?.fullname || 'Một thành viên',
      token,
    );

    if (!mailSent) {
      // Nếu gửi email lỗi, xóa lời mời để tránh rác DB
      await this.prisma.workspaceInvitation.delete({
        where: { id: invitation.id },
      });
      throw new BadRequestException(
        'Gửi email lời mời thất bại. Vui lòng thử lại sau.',
      );
    }

    // Phát sự kiện thông báo thời gian thực nếu người dùng đã có tài khoản trên hệ thống
    const invitedUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (invitedUser) {
      this.eventEmitter.emit(
        'member.invited',
        new MemberInvitedEvent(
          invitedUser.id,
          'Lời mời tham gia Workspace',
          `${inviter?.fullname || 'Một thành viên'} đã mời bạn tham gia Workspace "${workspace.name}"`,
          `/workspace-invitations/accept?token=${token}`,
          workspaceId,
        ),
      );
    }

    return {
      message: 'Đã gửi lời mời tham gia thành công tới email ' + dto.email,
      invitationId: invitation.id,
    };
  }

  // 3. Chấp nhận lời mời tham gia Workspace
  async acceptInvitation(
    userId: string,
    userEmail: string,
    dto: AcceptInvitationDto,
  ) {
    const invitation = await this.prisma.workspaceInvitation.findUnique({
      where: { token: dto.token },
      include: {
        workspace: true,
      },
    });

    if (!invitation || invitation.workspace.deletedAt) {
      throw new BadRequestException('Lời mời không hợp lệ');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Lời mời đã hết hạn');
    }

    // Kiểm tra xem email của tài khoản đăng nhập có khớp với email lời mời
    if (invitation.email !== userEmail) {
      throw new ForbiddenException(
        'Email của tài khoản hiện tại không trùng khớp với email nhận lời mời',
      );
    }

    // Thực hiện transaction: Tạo/Cập nhật Member và xóa Lời mời
    return this.prisma.$transaction(async (tx) => {
      const existingMember = await tx.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: invitation.workspaceId,
            userId,
          },
        },
      });

      let member;
      if (existingMember) {
        member = await tx.workspaceMember.update({
          where: { id: existingMember.id },
          data: {
            status: MemberStatus.ACTIVE,
            role: invitation.role,
            joinedAt: new Date(),
          },
        });
      } else {
        member = await tx.workspaceMember.create({
          data: {
            workspaceId: invitation.workspaceId,
            userId,
            role: invitation.role,
            status: MemberStatus.ACTIVE,
            joinedAt: new Date(),
          },
        });
      }

      // Xóa lời mời sau khi dùng
      await tx.workspaceInvitation.delete({
        where: { id: invitation.id },
      });

      return {
        message: 'Tham gia không gian làm việc thành công',
        workspace: invitation.workspace,
        role: member.role,
      };
    });
  }

  // 4. Cập nhật vai trò thành viên (chỉ OWNER được làm)
  async updateMemberRole(
    workspaceId: string,
    currentUserId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
  ) {
    const member = await this.prisma.workspaceMember.findFirst({
      where: { id: memberId, workspaceId },
    });

    if (!member) {
      throw new NotFoundException(
        'Không tìm thấy thành viên trong không gian làm việc này',
      );
    }

    // Không được tự hạ vai trò OWNER của bản thân nếu là OWNER duy nhất
    if (
      member.userId === currentUserId &&
      member.role === WorkspaceRole.OWNER &&
      dto.role !== WorkspaceRole.OWNER
    ) {
      const ownerCount = await this.prisma.workspaceMember.count({
        where: {
          workspaceId,
          role: WorkspaceRole.OWNER,
          status: MemberStatus.ACTIVE,
        },
      });

      if (ownerCount <= 1) {
        throw new BadRequestException(
          'Không thể thay đổi vai trò của Chủ sở hữu duy nhất. Vui lòng bổ nhiệm một Chủ sở hữu khác trước.',
        );
      }
    }

    return this.prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role: dto.role },
      select: {
        id: true,
        role: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
      },
    });
  }

  // 5. Xóa thành viên hoặc Rời khỏi Workspace
  async removeMember(
    workspaceId: string,
    currentUserId: string,
    memberId: string,
  ) {
    const targetMember = await this.prisma.workspaceMember.findFirst({
      where: { id: memberId, workspaceId },
    });

    if (!targetMember) {
      throw new NotFoundException(
        'Không tìm thấy thành viên trong không gian làm việc này',
      );
    }

    const isSelfRemove = targetMember.userId === currentUserId;

    // Lấy thông tin vai trò người thực thi hành động trong workspace
    const actorMember = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: currentUserId,
        },
      },
    });

    if (!actorMember) {
      throw new ForbiddenException('Bạn không thuộc không gian làm việc này');
    }

    // Kiểm tra quyền hạn
    if (!isSelfRemove) {
      // Muốn xóa người khác:
      if (
        actorMember.role === WorkspaceRole.MEMBER ||
        actorMember.role === WorkspaceRole.VIEWER
      ) {
        throw new ForbiddenException('Bạn không có quyền xóa thành viên khác');
      }

      // ADMIN không được xóa OWNER hoặc ADMIN khác
      if (actorMember.role === WorkspaceRole.ADMIN) {
        if (
          targetMember.role === WorkspaceRole.OWNER ||
          targetMember.role === WorkspaceRole.ADMIN
        ) {
          throw new ForbiddenException(
            'Quản trị viên không thể xóa Chủ sở hữu hoặc Quản trị viên khác',
          );
        }
      }
    }

    // Nếu tự rời khỏi Workspace, cần đảm bảo không phải là OWNER duy nhất
    if (targetMember.role === WorkspaceRole.OWNER) {
      const ownerCount = await this.prisma.workspaceMember.count({
        where: {
          workspaceId,
          role: WorkspaceRole.OWNER,
          status: MemberStatus.ACTIVE,
        },
      });

      if (ownerCount <= 1) {
        throw new BadRequestException(
          isSelfRemove
            ? 'Bạn là Chủ sở hữu duy nhất của workspace này và không thể rời đi. Vui lòng chuyển quyền hoặc giải tán workspace.'
            : 'Không thể xóa Chủ sở hữu duy nhất khỏi workspace.',
        );
      }
    }

    await this.prisma.workspaceMember.delete({
      where: { id: memberId },
    });

    return {
      message: isSelfRemove
        ? 'Bạn đã rời khỏi không gian làm việc thành công'
        : 'Đã xóa thành viên khỏi không gian làm việc thành công',
    };
  }
}
