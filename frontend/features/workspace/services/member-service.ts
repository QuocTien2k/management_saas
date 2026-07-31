import { apiClient } from '@/shared/api/client';
import {
  WorkspaceMember,
  InviteMemberInput,
  AcceptInvitationInput,
  WorkspaceRole,
  WorkspaceInvitation,
} from '../types/workspace';
import { ApiResponse } from './workspace-service';

export const memberService = {
  // Lấy danh sách thành viên trong workspace
  async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const response = await apiClient.get<ApiResponse<WorkspaceMember[]>>(
      `/workspaces/${workspaceId}/members`
    );
    return response.data.data;
  },

  // Mời thành viên mới gia nhập workspace qua email
  async inviteMember(
    workspaceId: string,
    data: InviteMemberInput
  ): Promise<WorkspaceInvitation> {
    const response = await apiClient.post<ApiResponse<WorkspaceInvitation>>(
      `/workspaces/${workspaceId}/members/invite`,
      data
    );
    return response.data.data;
  },

  // Chấp nhận lời mời tham gia workspace
  async acceptInvitation(
    data: AcceptInvitationInput
  ): Promise<{ workspace: any }> {
    const response = await apiClient.post<ApiResponse<{ workspace: any }>>(
      `/workspace-invitations/accept`,
      data
    );
    return response.data.data;
  },

  // Cập nhật vai trò thành viên (chỉ OWNER)
  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    role: WorkspaceRole
  ): Promise<WorkspaceMember> {
    const response = await apiClient.patch<ApiResponse<WorkspaceMember>>(
      `/workspaces/${workspaceId}/members/${memberId}/role`,
      { role }
    );
    return response.data.data;
  },

  // Xóa thành viên khỏi workspace hoặc tự rời khỏi workspace
  async removeMember(workspaceId: string, memberId: string): Promise<void> {
    await apiClient.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  },
};
