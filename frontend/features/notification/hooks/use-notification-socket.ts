import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { toast } from '@/lib/toast';
import { Notification } from '../types/notification.types';
import { WORKSPACE_KEYS } from '@/features/workspace/hooks/use-workspace';
import { NOTIFICATION_KEYS } from './use-notifications';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ||
  'http://localhost:3001';

export function useNotificationSocket() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    const socket: Socket = io(SOCKET_URL, {
      query: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('⚡ Notification Socket connected successfully');
    });

    socket.on('notification:received', (notification: Notification) => {
      console.log('🔔 Real-time notification received:', notification);

      // Hiển thị toast thông báo thời gian thực
      const toastMessage = notification.title && notification.message
        ? `${notification.title}: ${notification.message}`
        : notification.message || notification.title || 'Thông báo mới';
      toast.info(toastMessage);

      // Làm mới danh sách thông báo & unread count trên UI
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });

      // Nếu thông báo là lời mời tham gia workspace hoặc thay đổi workspace, refresh workspace list
      if (
        notification.type === 'MEMBER_INVITED' ||
        notification.workspaceId ||
        notification.link?.includes('workspace')
      ) {
        queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.lists() });
      }
    });

    socket.on('notification:read', (data: { id: string }) => {
      console.log('🔔 Real-time notification read:', data);
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    });

    socket.on('notification:read_all', (data: { userId: string }) => {
      console.log('🔔 Real-time all notifications read:', data);
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    });

    socket.on('disconnect', () => {
      console.log('🔌 Notification Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, queryClient]);
}
