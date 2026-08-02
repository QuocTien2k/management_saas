import { apiClient } from '@/shared/api/client';
import { ActivityLogFilters, ActivityLogResponse } from '../types/activity-log.types';

export const activityLogService = {
  async getWorkspaceLogs(workspaceId: string, filters?: ActivityLogFilters): Promise<ActivityLogResponse> {
    const response = await apiClient.get(`/activity-logs/workspace/${workspaceId}`, {
      params: filters,
    });
    return response.data?.data || response.data;
  },

  async getProjectLogs(projectId: string, filters?: ActivityLogFilters): Promise<ActivityLogResponse> {
    const response = await apiClient.get(`/activity-logs/project/${projectId}`, {
      params: filters,
    });
    return response.data?.data || response.data;
  },

  async getTaskLogs(taskId: string, filters?: ActivityLogFilters): Promise<ActivityLogResponse> {
    const response = await apiClient.get(`/activity-logs/task/${taskId}`, {
      params: filters,
    });
    return response.data?.data || response.data;
  },
};
