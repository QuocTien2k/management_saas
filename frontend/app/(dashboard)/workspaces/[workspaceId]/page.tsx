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
import { WorkspaceAvatar } from '@/features/workspace/components/workspace-avatar';
import { InviteMemberDialog } from '@/features/workspace/components/invite-member-dialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function WorkspaceDashboardPage() {
  const params = useParams();
  const workspaceId = params?.workspaceId as string;

  const { data: workspace, isLoading: isWsLoading } = useWorkspaceDetail(workspaceId);
  const { data: members } = useWorkspaceMembers(workspaceId);
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          {workspace && <WorkspaceAvatar name={workspace.name} logoUrl={workspace.logoUrl} size="lg" />}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{workspace?.name || 'Workspace'}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {workspace?.description || 'Tổng quan công việc và dự án trong nhóm của bạn.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setInviteDialogOpen(true)} variant="outline" className="gap-2">
            <UserPlusIcon className="size-4" />
            Mời thành viên
          </Button>
          <Link href={`/workspaces/${workspaceId}/projects`}>
            <Button className="gap-2">
              <PlusIcon className="size-4" />
              Tạo Dự án mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Dự án</CardTitle>
            <FolderKanbanIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspace?._count?.projects || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Dự án đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-heading">Thành viên</CardTitle>
            <UsersIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members?.length || workspace?._count?.members || 1}</div>
            <p className="text-xs text-muted-foreground mt-1">Thành viên tham gia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Công việc hoàn thành</CardTitle>
            <CheckCircle2Icon className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Trong tuần này</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Việc sắp hết hạn</CardTitle>
            <ClockIcon className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Cần hoàn thành sớm</p>
          </CardContent>
        </Card>
      </div>

      {/* Member summary & Recent Activity preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Dự án gần đây</CardTitle>
            <CardDescription>Các dự án mới nhất trong Workspace này.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <FolderKanbanIcon className="size-10 stroke-1 mb-2 opacity-50" />
              <p className="text-sm font-medium">Chưa có dự án nào được tạo.</p>
              <Link href={`/workspaces/${workspaceId}/projects`} className="mt-3">
                <Button size="sm" variant="outline" className="gap-1.5">
                  <PlusIcon className="size-4" /> Tạo dự án đầu tiên
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Thành viên nhóm</CardTitle>
              <CardDescription>{members?.length || 1} thành viên</CardDescription>
            </div>
            <Link href={`/workspaces/${workspaceId}/members`}>
              <Button size="xs" variant="ghost">Xem tất cả</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members?.slice(0, 5).map((m) => (
                <div key={m.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      {m.user.avatar && <AvatarImage src={m.user.avatar} />}
                      <AvatarFallback>
                        {(m.user.fullname || m.user.email).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">{m.user.fullname || 'Thành viên'}</span>
                      <span className="text-[11px] text-muted-foreground">{m.user.email}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <InviteMemberDialog workspaceId={workspaceId} open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />
    </div>
  );
}
