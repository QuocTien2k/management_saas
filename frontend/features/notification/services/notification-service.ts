import { apiClient } from '@/shared/api/client';
import { NotificationListResponse, Notification } from '../types/notification.types';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const notificationService = {
  async getNotifications(params?: {
    workspaceId?: string;
    isRead?: boolean;
    page?: number;
    limit?: number;
  }): Promise<NotificationListResponse> {
    const response = await apiClient.get<ApiResponse<NotificationListResponse>>('/notifications', { params });
    const res = response.data as any;
    return res.data || res;
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`, {});
    const res = response.data as any;
    return res.data || res;
  },

  async markAllAsRead(workspaceId?: string): Promise<{ message: string }> {
    const response = await apiClient.patch<ApiResponse<{ message: string }>>('/notifications/read-all', {}, {
      params: { workspaceId },
    });
    const res = response.data as any;
    return res.data || res;
  },

  async deleteNotification(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/notifications/${id}`);
    const res = response.data as any;
    return res.data || res;
  },
};
