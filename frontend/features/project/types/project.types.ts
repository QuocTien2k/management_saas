export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string | null;
  status: ProjectStatus;
  color?: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tasks?: number;
  };
}

export interface CreateProjectInput {
  name: string;
  key: string;
  description?: string;
  status?: ProjectStatus;
  color?: string;
  workspaceId?: string;
}

export interface UpdateProjectInput {
  name?: string;
  key?: string;
  description?: string;
  status?: ProjectStatus;
  color?: string;
}
