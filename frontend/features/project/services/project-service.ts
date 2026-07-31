import { apiClient } from '@/shared/api/client';
import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from '../types/project.types';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const projectService = {
  // Lấy danh sách dự án trong workspace
  async getProjects(workspaceId?: string): Promise<Project[]> {
    if (!workspaceId) return [];
    const response = await apiClient.get<ApiResponse<Project[]>>(`/projects/workspace/${workspaceId}`);
    return response.data.data;
  },

  // Lấy chi tiết dự án theo ID
  async getProjectById(id: string): Promise<Project> {
    const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data.data;
  },

  // Tạo dự án mới
  async createProject(data: CreateProjectInput, workspaceId?: string): Promise<Project> {
    const targetWorkspaceId = data.workspaceId || workspaceId;
    const payload = {
      ...data,
      workspaceId: targetWorkspaceId,
    };
    const headers = targetWorkspaceId ? { 'x-workspace-id': targetWorkspaceId } : {};
    const response = await apiClient.post<ApiResponse<Project>>('/projects', payload, { headers });
    return response.data.data;
  },

  // Cập nhật dự án
  async updateProject(id: string, data: UpdateProjectInput): Promise<Project> {
    const response = await apiClient.patch<ApiResponse<Project>>(`/projects/${id}`, data);
    return response.data.data;
  },

  // Xóa dự án
  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },
};
