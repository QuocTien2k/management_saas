'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ChevronsUpDownIcon,
  PlusIcon,
  CheckIcon,
  Building2Icon,
} from 'lucide-react';

import { useWorkspaces } from '../hooks/use-workspace';
import { useWorkspaceStore } from '../store/workspace-store';
import { WorkspaceAvatar } from './workspace-avatar';
import { CreateWorkspaceDialog } from './create-workspace-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function WorkspaceSwitcher() {
  const router = useRouter();
  const params = useParams();
  const workspaceIdFromUrl = params?.workspaceId as string | undefined;

  const { data: workspaces, isLoading } = useWorkspaces();
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  // Sync active workspace when URL or workspaces list updates
  React.useEffect(() => {
    if (!workspaces || workspaces.length === 0) return;

    if (workspaceIdFromUrl) {
      const found = workspaces.find((w) => w.id === workspaceIdFromUrl);
      if (found && found.id !== activeWorkspace?.id) {
        setActiveWorkspace(found);
      }
    } else if (!activeWorkspace) {
      setActiveWorkspace(workspaces[0]);
    }
  }, [workspaces, workspaceIdFromUrl, activeWorkspace, setActiveWorkspace]);

  const currentWorkspace =
    activeWorkspace || (workspaces && workspaces.length > 0 ? workspaces[0] : null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="flex w-full items-center justify-between gap-2.5 rounded-xl border border-border bg-background p-2.5 text-left text-sm font-medium shadow-xs transition-all hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-card">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {currentWorkspace ? (
                  <WorkspaceAvatar name={currentWorkspace.name} logoUrl={currentWorkspace.logoUrl} size="sm" />
                ) : (
                  <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Building2Icon className="size-4" />
                  </div>
                )}
                <div className="grid flex-1 text-left text-xs leading-tight">
                  <span className="truncate font-semibold text-sm text-foreground">
                    {isLoading ? 'Đang tải...' : currentWorkspace?.name || 'Chọn Workspace'}
                  </span>
                  <span className="truncate text-muted-foreground">
                    {currentWorkspace?._count?.members || 1} thành viên
                  </span>
                </div>
              </div>
              <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
            </button>
          }
        />

        <DropdownMenuContent className="w-64" align="start">
          <DropdownMenuLabel>Danh sách Workspace</DropdownMenuLabel>
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {workspaces?.map((ws) => {
              const isSelected = currentWorkspace?.id === ws.id;
              return (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspace(ws);
                    router.push(`/workspaces/${ws.id}`);
                  }}
                  className="flex items-center justify-between cursor-pointer py-2"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <WorkspaceAvatar name={ws.name} logoUrl={ws.logoUrl} size="sm" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate font-medium text-sm">{ws.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {ws._count?.members || 1} thành viên
                      </span>
                    </div>
                  </div>
                  {isSelected && <CheckIcon className="size-4 text-primary shrink-0 ml-2" />}
                </DropdownMenuItem>
              );
            })}
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setCreateDialogOpen(true)}
            className="cursor-pointer text-primary focus:text-primary font-medium py-2"
          >
            <PlusIcon className="size-4 mr-2" />
            Tạo Workspace mới
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateWorkspaceDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </>
  );
}
