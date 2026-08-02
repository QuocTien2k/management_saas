import { useQuery } from '@tanstack/react-query';
import { activityLogService } from '../services/activity-log-service';
import { ActivityLogFilters } from '../types/activity-log.types';

export function useWorkspaceActivityLogs(workspaceId?: string | null, filters?: ActivityLogFilters) {
  return useQuery({
    queryKey: ['activity-logs', 'workspace', workspaceId, filters],
    queryFn: () => activityLogService.getWorkspaceLogs(workspaceId!, filters),
    enabled: Boolean(workspaceId),
  });
}

export function useProjectActivityLogs(projectId?: string | null, filters?: ActivityLogFilters) {
  return useQuery({
    queryKey: ['activity-logs', 'project', projectId, filters],
    queryFn: () => activityLogService.getProjectLogs(projectId!, filters),
    enabled: Boolean(projectId),
  });
}

export function useTaskActivityLogs(taskId?: string | null, filters?: ActivityLogFilters) {
  return useQuery({
    queryKey: ['activity-logs', 'task', taskId, filters],
    queryFn: () => activityLogService.getTaskLogs(taskId!, filters),
    enabled: Boolean(taskId),
  });
}
