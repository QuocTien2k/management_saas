export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string | null;
  status: ProjectStatus;
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
}

export interface UpdateProjectInput {
  name?: string;
  key?: string;
  description?: string;
  status?: ProjectStatus;
}
