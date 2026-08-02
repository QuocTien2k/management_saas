'use client';

import * as React from 'react';
import {
  ActivityIcon,
  CheckCircle2Icon,
  PlusCircleIcon,
  MessageSquareIcon,
  UserPlusIcon,
  FileTextIcon,
  FolderKanbanIcon,
  Loader2Icon,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useWorkspaceActivityLogs } from '@/features/activity-log/hooks/use-activity-log';
import { ActivityLogItem } from '@/features/activity-log/types/activity-log.types';

interface RecentActivityFeedProps {
  workspaceId?: string;
}

function getActivityIcon(action: string, entityType: string) {
  if (action.includes('DONE') || action.includes('COMPLETE')) {
    return <CheckCircle2Icon className="size-3.5 text-emerald-500" />;
  }
  if (action.includes('COMMENT')) {
    return <MessageSquareIcon className="size-3.5 text-blue-500" />;
  }
  if (action.includes('CREATE') || action.includes('ADD')) {
    return <PlusCircleIcon className="size-3.5 text-indigo-500" />;
  }
  if (entityType === 'MEMBER' || action.includes('MEMBER')) {
    return <UserPlusIcon className="size-3.5 text-amber-500" />;
  }
  if (entityType === 'PROJECT') {
    return <FolderKanbanIcon className="size-3.5 text-purple-500" />;
  }
  return <FileTextIcon className="size-3.5 text-muted-foreground" />;
}

function formatTimeAgo(dateString: string) {
  try {
    const date = new Date(dateString);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  } catch {
    return dateString;
  }
}

export function RecentActivityFeed({ workspaceId }: RecentActivityFeedProps) {
  const { data, isLoading } = useWorkspaceActivityLogs(workspaceId, { limit: 5 });

  const activities: ActivityLogItem[] = data?.items || [];

  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ActivityIcon className="size-4 text-primary" />
          <CardTitle className="text-base font-semibold">Nhật ký Hoạt động Gần đây</CardTitle>
        </div>
        <CardDescription className="text-xs">Theo dõi lịch sử thay đổi thực tế trong nhóm.</CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-1 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2Icon className="size-5 animate-spin mr-2" />
            <span className="text-xs">Đang tải nhật ký...</span>
          </div>
        ) : activities.length === 0 ? (
          <p className="text-xs text-muted-foreground italic text-center py-4">
            Chưa có hoạt động nào được ghi nhận.
          </p>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="flex items-start gap-3 text-xs p-2 rounded-xl hover:bg-muted/40 transition-colors">
              <div className="size-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 mt-0.5 border border-border/50">
                {getActivityIcon(act.action, act.entityType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground leading-snug">
                  <span className="font-semibold text-foreground">{act.user?.fullname || 'Hệ thống'}</span>{' '}
                  <span className="text-muted-foreground">{act.action}</span>{' '}
                  <span className="font-semibold text-primary">{act.entityName}</span>
                </p>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  {formatTimeAgo(act.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
