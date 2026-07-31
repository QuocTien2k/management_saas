import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberService } from '../services/member-service';
import {
  InviteMemberInput,
  AcceptInvitationInput,
  WorkspaceRole,
} from '../types/workspace';

export const MEMBER_KEYS = {
  all: ['members'] as const,
  list: (workspaceId: string) => [...MEMBER_KEYS.all, 'list', workspaceId] as const,
};

// Hook lấy danh sách thành viên của workspace
export function useWorkspaceMembers(workspaceId: string | null) {
  return useQuery({
    queryKey: MEMBER_KEYS.list(workspaceId || ''),
    queryFn: () => memberService.getMembers(workspaceId!),
    enabled: !!workspaceId,
  });
}

// Hook mời thành viên mới
export function useInviteMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteMemberInput) =>
      memberService.inviteMember(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMBER_KEYS.list(workspaceId) });
    },
  });
}

// Hook chấp nhận lời mời
export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AcceptInvitationInput) =>
      memberService.acceptInvitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

// Hook đổi vai trò thành viên
export function useUpdateMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: WorkspaceRole }) =>
      memberService.updateMemberRole(workspaceId, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMBER_KEYS.list(workspaceId) });
    },
  });
}

// Hook xóa/rời thành viên
export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) =>
      memberService.removeMember(workspaceId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMBER_KEYS.list(workspaceId) });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}
