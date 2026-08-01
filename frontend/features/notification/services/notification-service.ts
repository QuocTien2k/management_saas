import { apiClient } from '@/shared/api/client';
import { NotificationListResponse, Notification } from '../types/notification.types';

export const notificationService = {
  async getNotifications(params?: {
    workspaceId?: string;
    isRead?: boolean;
    page?: number;
    limit?: number;
  }): Promise<NotificationListResponse> {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead(workspaceId?: string): Promise<{ message: string }> {
    const response = await apiClient.patch('/notifications/read-all', null, {
      params: { workspaceId },
    });
    return response.data;
  },

  async deleteNotification(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },
};
