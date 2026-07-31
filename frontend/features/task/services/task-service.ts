import { apiClient } from '@/shared/api/client';
import { Task, CreateTaskInput, UpdateTaskInput, MoveTaskInput, TaskFilters } from '../types/task.types';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ProjectColumn {
  id: string;
  name: string;
  status: string;
  position: number;
  projectId: string;
}

export const taskService = {
  // Lấy các cột Kanban của project
  async getProjectColumns(projectId: string): Promise<ProjectColumn[]> {
    const response = await apiClient.get<ApiResponse<ProjectColumn[]>>(`/projects/${projectId}/columns`);
    return response.data.data;
  },

  // Lấy danh sách task của project
  async getProjectTasks(projectId: string, filters?: TaskFilters): Promise<Task[]> {
    const response = await apiClient.get<ApiResponse<Task[]>>(`/tasks/project/${projectId}`, {
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
    // Nếu chưa có columnId, lấy danh sách column của project để map columnId tương ứng
    let targetColumnId = (data as any).columnId;
    if (!targetColumnId) {
      const columns = await this.getProjectColumns(projectId);
      const targetStatus = data.status || 'TODO';
      const matchedColumn = columns.find((c) => c.status === targetStatus) || columns[0];
      targetColumnId = matchedColumn?.id;
    }

    const { status, ...restData } = data;

    const payload = {
      ...restData,
      projectId,
      columnId: targetColumnId,
    };

    const response = await apiClient.post<ApiResponse<Task>>('/tasks', payload);
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
