'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Loader2Icon } from 'lucide-react';

import { useWorkspaceDetail } from '@/features/workspace/hooks/use-workspace';
import { useWorkspaceMembers } from '@/features/workspace/hooks/use-members';
import { WorkspaceSettingsForm } from '@/features/workspace/components/workspace-settings-form';
import { useAuthStore } from '@/features/auth/store/auth-store';

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const workspaceId = params?.workspaceId as string;

  const { user } = useAuthStore();
  const { data: workspace, isLoading: isWsLoading } = useWorkspaceDetail(workspaceId);
  const { data: members } = useWorkspaceMembers(workspaceId);

  const currentMember = members?.find(
    (m) => m.userId === user?.id || m.user?.id === user?.id
  );
  const currentUserRole = currentMember?.role || 'MEMBER';

  if (isWsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <Loader2Icon className="size-8 animate-spin text-primary" />
        <p className="text-sm">Đang tải cài đặt Workspace...</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive">
        <p className="font-semibold">Không tìm thấy thông tin Workspace.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Cài đặt Workspace</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý cài đặt không gian làm việc, biểu tượng và các vùng cấu hình quan trọng.
        </p>
      </div>

      <WorkspaceSettingsForm workspace={workspace} currentUserRole={currentUserRole} />
    </div>
  );
}
