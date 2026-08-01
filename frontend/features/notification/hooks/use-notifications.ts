import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification-service';

export const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  list: (workspaceId?: string) => [...NOTIFICATION_KEYS.all, 'list', workspaceId || 'all'] as const,
};

// Hook lấy danh sách thông báo
export function useNotifications(workspaceId?: string) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(workspaceId),
    queryFn: () => notificationService.getNotifications({ workspaceId }),
  });
}

// Hook đánh dấu đọc 1 thông báo
export function useMarkNotificationAsRead(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
}

// Hook đánh dấu đọc tất cả thông báo
export function useMarkAllNotificationsAsRead(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
}

// Hook xóa thông báo
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
}
