'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  FolderKanbanIcon,
  UsersIcon,
  CheckCircle2Icon,
  ClockIcon,
  PlusIcon,
  UserPlusIcon,
} from 'lucide-react';

import { useWorkspaceDetail } from '@/features/workspace/hooks/use-workspace';
import { useWorkspaceMembers } from '@/features/workspace/hooks/use-members';
import { useProjects } from '@/features/project/hooks/use-projects';
import { useWorkspaceTasks } from '@/features/task/hooks/use-tasks';
import { WorkspaceAvatar } from '@/features/workspace/components/workspace-avatar';
import { InviteMemberDialog } from '@/features/workspace/components/invite-member-dialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProjectCard } from '@/features/project/components/project-card';
import { TaskStatusChart } from '@/features/dashboard/components/task-status-chart';
import { ProductivityChart } from '@/features/dashboard/components/productivity-chart';
import { RecentActivityFeed } from '@/features/dashboard/components/recent-activity-feed';

export default function WorkspaceDashboardPage() {
  const params = useParams();
  const workspaceId = params?.workspaceId as string;

  const { data: workspace } = useWorkspaceDetail(workspaceId);
  const { data: members } = useWorkspaceMembers(workspaceId);
  const { data: projects } = useProjects(workspaceId);
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);

  const projectIds = React.useMemo(() => projects?.map((p) => p.id) || [], [projects]);
  const { tasks: allTasks } = useWorkspaceTasks(projectIds);

  const todoCount = allTasks.filter((t) => t.status === 'TODO').length;
  const inProgressCount = allTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const inReviewCount = allTasks.filter((t) => t.status === 'IN_REVIEW').length;
  const doneCount = allTasks.filter((t) => t.status === 'DONE').length;

  const overdueCount = allTasks.filter((t) => {
    if (!t.dueDate || t.status === 'DONE') return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/70 pb-5">
        <div className="flex items-center gap-4">
          {workspace && (
            <WorkspaceAvatar
              name={workspace.name}
              logo={workspace.logo}
              logoUrl={workspace.logoUrl}
              size="lg"
            />
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{workspace?.name || 'Workspace'}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {workspace?.description || 'Tổng quan công việc và tiến độ dự án trong nhóm của bạn.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setInviteDialogOpen(true)}
            variant="outline"
            size="sm"
            className="gap-2 shadow-xs cursor-pointer"
          >
            <UserPlusIcon className="size-4 text-muted-foreground" />
            Mời thành viên
          </Button>
          <Link href={`/workspaces/${workspaceId}/projects`}>
            <Button size="sm" className="gap-2 shadow-xs cursor-pointer">
              <PlusIcon className="size-4" />
              Tạo Dự án mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs border-border/80 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tổng Dự án</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FolderKanbanIcon className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{projects?.length ?? workspace?._count?.projects ?? 0}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Dự án đang hoạt động</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thành viên</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <UsersIcon className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{members?.length || workspace?._count?.members || 1}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Thành viên tham gia</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Công việc xong</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2Icon className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{doneCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Trong tuần này</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Việc hết hạn</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ClockIcon className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{overdueCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Cần xử lý gấp</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TaskStatusChart
          todoCount={todoCount}
          inProgressCount={inProgressCount}
          inReviewCount={inReviewCount}
          doneCount={doneCount}
        />
        <ProductivityChart tasks={allTasks} />
      </div>

      {/* Recent Projects & Activity Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Dự án gần đây</CardTitle>
              <CardDescription className="text-xs">Các dự án mới nhất trong Workspace này.</CardDescription>
            </div>
            <Link href={`/workspaces/${workspaceId}/projects`}>
              <Button size="xs" variant="ghost" className="text-xs">Xem tất cả</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-5 pt-1">
            {projects && projects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.slice(0, 4).map((proj) => (
                  <ProjectCard key={proj.id} project={proj} workspaceId={workspaceId} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border border-dashed border-border/70 rounded-xl bg-muted/20">
                <FolderKanbanIcon className="size-9 stroke-1.5 mb-2.5 opacity-40 text-primary" />
                <p className="text-xs font-medium">Chưa có dự án nào được tạo.</p>
                <Link href={`/workspaces/${workspaceId}/projects`} className="mt-3">
                  <Button size="xs" variant="outline" className="gap-1.5 shadow-xs">
                    <PlusIcon className="size-3.5" /> Tạo dự án đầu tiên
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <RecentActivityFeed workspaceId={workspaceId} />
      </div>

      <InviteMemberDialog workspaceId={workspaceId} open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />
    </div>
  );
}
