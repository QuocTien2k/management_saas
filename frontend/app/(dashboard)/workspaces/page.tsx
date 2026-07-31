'use client';

import * as React from 'react';
import { PlusIcon, Building2Icon, Loader2Icon } from 'lucide-react';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspace';
import { WorkspaceCard } from '@/features/workspace/components/workspace-card';
import { CreateWorkspaceDialog } from '@/features/workspace/components/create-workspace-dialog';
import { Button } from '@/components/ui/button';

export default function WorkspacesPage() {
  const { data: workspaces, isLoading, isError } = useWorkspaces();
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-muted/30 p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Không gian làm việc của bạn
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Chọn một Workspace để bắt đầu quản lý dự án và công việc nhóm.
            </p>
          </div>

          <Button
            onClick={() => setCreateDialogOpen(true)}
            size="lg"
            className="gap-2 shadow-sm"
          >
            <PlusIcon className="size-4" />
            Tạo Workspace mới
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Loader2Icon className="size-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Đang tải danh sách Workspace...</p>
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center text-destructive">
            <p className="font-semibold">Có lỗi xảy ra khi tải danh sách Workspace.</p>
            <p className="text-sm text-muted-foreground mt-1">Vui lòng thử lại sau.</p>
          </div>
        ) : workspaces && workspaces.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background p-12 text-center shadow-xs dark:bg-card">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
              <Building2Icon className="size-7" />
            </div>
            <h3 className="text-lg font-semibold">Chưa có Workspace nào</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Bạn chưa tham gia Workspace nào. Hãy tạo Workspace đầu tiên để bắt đầu công việc.
            </p>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="mt-6 gap-2"
            >
              <PlusIcon className="size-4" />
              Tạo Workspace mới ngay
            </Button>
          </div>
        )}
      </div>

      <CreateWorkspaceDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
