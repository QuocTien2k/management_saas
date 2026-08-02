export interface ActivityLogUser {
  id: string;
  fullname: string;
  avatar?: string | null;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  details?: Record<string, any> | null;
  userId: string;
  workspaceId: string;
  projectId?: string | null;
  taskId?: string | null;
  createdAt: string;
  user: ActivityLogUser;
}

export interface ActivityLogFilters {
  page?: number;
  limit?: number;
  userId?: string;
  projectId?: string;
  entityType?: string;
}

export interface ActivityLogResponse {
  items: ActivityLogItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
