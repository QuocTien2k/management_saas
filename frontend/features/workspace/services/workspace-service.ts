import { apiClient } from '@/shared/api/client';
import {
  Workspace,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
} from '../types/workspace';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const workspaceService = {
  // Lấy tất cả workspace người dùng tham gia
  async getWorkspaces(): Promise<Workspace[]> {
    const response = await apiClient.get<ApiResponse<Workspace[]>>('/workspaces');
    return response.data.data;
  },

  // Lấy chi tiết workspace theo ID
  async getWorkspaceById(id: string): Promise<Workspace> {
    const response = await apiClient.get<ApiResponse<Workspace>>(`/workspaces/${id}`);
    return response.data.data;
  },

  // Tạo workspace mới
  async createWorkspace(data: CreateWorkspaceInput): Promise<Workspace> {
    const logoVal = data.logo || data.logoUrl;
    const payload = {
      name: data.name,
      ...(data.description ? { description: data.description } : {}),
      ...(logoVal ? { logo: logoVal } : {}),
    };
    const response = await apiClient.post<ApiResponse<Workspace>>('/workspaces', payload);
    return response.data.data;
  },

  // Cập nhật thông tin workspace
  async updateWorkspace(id: string, data: UpdateWorkspaceInput): Promise<Workspace> {
    const logoVal = data.logo || data.logoUrl;
    const payload = {
      ...(data.name ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(logoVal !== undefined ? { logo: logoVal } : {}),
    };
    const response = await apiClient.patch<ApiResponse<Workspace>>(`/workspaces/${id}`, payload);
    return response.data.data;
  },

  // Xóa workspace (soft delete)
  async deleteWorkspace(id: string): Promise<void> {
    await apiClient.delete(`/workspaces/${id}`);
  },
};
