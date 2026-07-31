import { apiClient } from '@/shared/api/client';
import { Task, CreateTaskInput, UpdateTaskInput, MoveTaskInput, TaskFilters } from '../types/task.types';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const taskService = {
  // Lấy danh sách task của project
  async getProjectTasks(projectId: string, filters?: TaskFilters): Promise<Task[]> {
    const response = await apiClient.get<ApiResponse<Task[]>>(`/projects/${projectId}/tasks`, {
      params: filters,
    });
    return response.data.data;
  },

  // Lấy chi tiết 1 task
  async getTaskById(taskId: string): Promise<Task> {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${taskId}`);
    return response.data.data;
  },

  // Tạo mới task
  async createTask(projectId: string, data: CreateTaskInput): Promise<Task> {
    const response = await apiClient.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, data);
    return response.data.data;
  },

  // Cập nhật thông tin task
  async updateTask(taskId: string, data: UpdateTaskInput): Promise<Task> {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${taskId}`, data);
    return response.data.data;
  },

  // Xóa task
  async deleteTask(taskId: string): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}`);
  },

  // Kéo thả/Di chuyển vị trí & trạng thái task
  async moveTask(taskId: string, data: MoveTaskInput): Promise<Task> {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${taskId}/move`, data);
    return response.data.data;
  },
};
