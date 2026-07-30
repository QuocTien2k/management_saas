import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { WorkspaceRoles } from '../../common/decorators/workspace-roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WorkspaceRole } from '@prisma/client';
import type { User } from '@prisma/client';

@Controller()
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  // 1. Lấy danh sách thành viên trong Workspace
  @Get('workspaces/:id/members')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @HttpCode(HttpStatus.OK)
  async listMembers(@Param('id') workspaceId: string) {
    return this.memberService.listMembers(workspaceId);
  }

  // 2. Mời thành viên mới vào Workspace (chỉ OWNER và ADMIN)
  @Post('workspaces/:id/members/invite')
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @HttpCode(HttpStatus.OK)
  async invite(
    @Param('id') workspaceId: string,
    @CurrentUser() user: User,
    @Body() dto: InviteMemberDto,
  ) {
    return this.memberService.inviteMember(workspaceId, user.id, dto);
  }

  // 3. Chấp nhận lời mời tham gia Workspace
  @Post('workspace-invitations/accept')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async accept(@CurrentUser() user: User, @Body() dto: AcceptInvitationDto) {
    return this.memberService.acceptInvitation(user.id, user.email, dto);
  }

  // 4. Thay đổi vai trò thành viên (chỉ OWNER)
  @Patch('workspaces/:id/members/:memberId/role')
  @WorkspaceRoles(WorkspaceRole.OWNER)
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @HttpCode(HttpStatus.OK)
  async updateRole(
    @Param('id') workspaceId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.memberService.updateMemberRole(
      workspaceId,
      user.id,
      memberId,
      dto,
    );
  }

  // 5. Xóa thành viên khỏi Workspace hoặc tự rời đi (Mọi Member hoạt động đều vào được, service kiểm soát phân quyền cụ thể)
  @Delete('workspaces/:id/members/:memberId')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') workspaceId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: User,
  ) {
    return this.memberService.removeMember(workspaceId, user.id, memberId);
  }
}
