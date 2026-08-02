import { useMemo } from 'react';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { useWorkspaceMembers } from './use-members';
import { WorkspaceRole } from '../types/workspace';

export function useRole(workspaceId: string | null) {
  const { user } = useAuthStore();
  const { data: members, isLoading } = useWorkspaceMembers(workspaceId);

  const roleInfo = useMemo(() => {
    if (!members || !user?.id) {
      return {
        role: null as WorkspaceRole | null,
        isOwner: false,
        isAdmin: false,
        isMember: false,
        canManageWorkspace: false,
        canManageProjects: false,
        canInviteMembers: false,
      };
    }

    const currentMember = members.find(
      (m) => m.userId === user.id || m.user?.id === user.id || m.id === user.id
    );

    const role = currentMember?.role || null;
    const isOwner = role === 'OWNER';
    const isAdmin = role === 'ADMIN';
    const isMember = role === 'MEMBER';

    return {
      role,
      isOwner,
      isAdmin,
      isMember,
      canManageWorkspace: isOwner,
      canManageProjects: isOwner || isAdmin,
      canInviteMembers: isOwner || isAdmin,
    };
  }, [members, user?.id]);

  return {
    ...roleInfo,
    isLoading,
  };
}
