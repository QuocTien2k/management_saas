import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/features/auth/store/auth-store';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ||
  'http://localhost:3001';

export function useTaskSocket(projectId: string | null) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!projectId || !accessToken) return;

    const socket: Socket = io(SOCKET_URL, {
      query: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('join_project', projectId);
    });

    const handleTaskChange = (data?: any) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ['task', data.id] });
      } else if (data?.taskId) {
        queryClient.invalidateQueries({ queryKey: ['task', data.taskId] });
      }
    };

    const handleCommentChange = (data?: any) => {
      const targetTaskId = data?.taskId || data?.id;
      if (targetTaskId) {
        queryClient.invalidateQueries({ queryKey: ['comments', targetTaskId] });
        queryClient.invalidateQueries({ queryKey: ['task', targetTaskId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['comments'] });
      }
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    };

    socket.on('task:created', handleTaskChange);
    socket.on('task:updated', handleTaskChange);
    socket.on('task:deleted', handleTaskChange);
    socket.on('task:moved', handleTaskChange);
    socket.on('column:created', handleTaskChange);
    socket.on('column:updated', handleTaskChange);
    socket.on('column:deleted', handleTaskChange);
    socket.on('comment:created', handleCommentChange);
    socket.on('comment:deleted', handleCommentChange);

    return () => {
      socket.emit('leave_project', projectId);
      socket.disconnect();
    };
  }, [projectId, accessToken, queryClient]);
}
