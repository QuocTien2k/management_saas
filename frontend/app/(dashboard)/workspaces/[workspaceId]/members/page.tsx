'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { UserPlusIcon, UsersIcon, Loader2Icon } from 'lucide-react';

import { useWorkspaceMembers } from '@/features/workspace/hooks/use-members';
import { MemberListTable } from '@/features/workspace/components/member-list-table';
import { InviteMemberDialog } from '@/features/workspace/components/invite-member-dialog';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { Button } from '@/components/ui/button';

export default function WorkspaceMembersPage() {
  const params = useParams();
  const workspaceId = params?.workspaceId as string;

  const { user } = useAuthStore();
  const { data: members, isLoading, isError } = useWorkspaceMembers(workspaceId);
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);

  // Derive current user role in workspace
  const currentMember = members?.find((m) => m.userId === user?.id);
  const currentUserRole = currentMember?.role || 'MEMBER';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thành viên Workspace</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý thành viên, danh sách phân quyền và gửi lời mời tham gia nhóm.
          </p>
        </div>

        <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
          <UserPlusIcon className="size-4" />
          Mời thành viên mới
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <Loader2Icon className="size-8 animate-spin text-primary" />
          <p className="text-sm">Đang tải danh sách thành viên...</p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive">
          <p className="font-semibold">Có lỗi xảy ra khi tải danh sách thành viên.</p>
        </div>
      ) : members && members.length > 0 ? (
        <MemberListTable
          workspaceId={workspaceId}
          members={members}
          currentUserId={user?.id}
          currentUserRole={currentUserRole}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <UsersIcon className="size-10 stroke-1 mb-2" />
          <p className="text-sm font-medium">Chưa có thành viên nào.</p>
        </div>
      )}

      <InviteMemberDialog
        workspaceId={workspaceId}
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  );
}
