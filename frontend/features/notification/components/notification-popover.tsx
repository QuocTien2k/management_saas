'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  BellIcon,
  CheckCheckIcon,
  CheckCircle2Icon,
  MessageSquareIcon,
  UserPlusIcon,
  ClockIcon,
  InboxIcon,
  Loader2Icon,
} from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '../hooks/use-notifications';
import { Notification, NotificationType } from '../types/notification.types';
import { cn } from '@/lib/utils';

interface NotificationPopoverProps {
  workspaceId?: string;
}

export function NotificationPopover({ workspaceId }: NotificationPopoverProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const { data: notificationsData, isLoading } = useNotifications(workspaceId);
  const markAsRead = useMarkNotificationAsRead(workspaceId);
  const markAllAsRead = useMarkAllNotificationsAsRead(workspaceId);

  const notifications = notificationsData?.items || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
    setOpen(false);

    if (notification.link) {
      let targetLink = notification.link;
      if (targetLink.startsWith('/project/') && (notification.workspaceId || workspaceId)) {
        const wsId = notification.workspaceId || workspaceId;
        targetLink = targetLink.replace('/project/', `/workspaces/${wsId}/projects/`);
      }
      router.push(targetLink);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'MEMBER_INVITED':
        return <UserPlusIcon className="size-4 text-blue-500" />;
      case 'TASK_COMMENT':
        return <MessageSquareIcon className="size-4 text-emerald-500" />;
      case 'TASK_ASSIGNED':
        return <CheckCircle2Icon className="size-4 text-indigo-500" />;
      case 'DUE_DATE_APPROACHING':
        return <ClockIcon className="size-4 text-amber-500" />;
      default:
        return <BellIcon className="size-4 text-primary" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            title={unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Thông báo'}
            className={cn(
              "relative flex size-9 items-center justify-center rounded-xl border border-border/80 bg-background/80 text-muted-foreground hover:text-foreground backdrop-blur-md transition-colors cursor-pointer dark:bg-card/80",
              unreadCount > 0 && "border-amber-500/40 bg-amber-500/5 text-amber-600 dark:text-amber-400"
            )}
          >
            <BellIcon className={cn("size-4", unreadCount > 0 && "animate-bell-shake text-amber-600 dark:text-amber-400")} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        }
      />

      <PopoverContent
        align="end"
        className="w-80 sm:w-96 p-0 shadow-xl border border-border/80 rounded-2xl backdrop-blur-md bg-popover/95 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 p-3.5 px-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <BellIcon className="size-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Thông báo</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[11px] font-semibold">
                {unreadCount} chưa đọc
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              className="h-7 px-2 text-[11px] font-medium text-muted-foreground hover:text-primary gap-1 cursor-pointer"
            >
              {markAllAsRead.isPending ? (
                <Loader2Icon className="size-3 animate-spin" />
              ) : (
                <CheckCheckIcon className="size-3.5" />
              )}
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        {/* List */}
        <div className="max-h-95 overflow-y-auto divide-y divide-border/40">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground text-xs gap-2">
              <Loader2Icon className="size-4 animate-spin text-primary" />
              Đang tải thông báo...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-2">
                <InboxIcon className="size-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">Không có thông báo nào</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Các thông báo phân công công việc hoặc lời mời sẽ hiển thị tại đây.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  'flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-accent/60',
                  !notification.isRead && 'bg-primary/5 dark:bg-primary/10'
                )}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border/60 shadow-xs mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn('text-xs font-medium text-foreground truncate', !notification.isRead && 'font-bold')}>
                      {notification.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {notification.message}
                  </p>
                </div>

                {!notification.isRead && (
                  <span className="size-2 rounded-full bg-primary shrink-0 self-center" />
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
