import { apiClient } from '@/shared/api/client';
import { Comment, CreateCommentInput, UpdateCommentInput } from '../types/comment.types';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const commentService = {
  // Lấy danh sách bình luận của task
  async getTaskComments(taskId: string): Promise<Comment[]> {
    const response = await apiClient.get<ApiResponse<Comment[]>>(`/tasks/${taskId}/comments`);
    return response.data.data;
  },

  // Tạo bình luận mới
  async createComment(taskId: string, data: CreateCommentInput): Promise<Comment> {
    const response = await apiClient.post<ApiResponse<Comment>>(`/tasks/${taskId}/comments`, data);
    return response.data.data;
  },

  // Cập nhật bình luận
  async updateComment(commentId: string, data: UpdateCommentInput): Promise<Comment> {
    const response = await apiClient.patch<ApiResponse<Comment>>(`/comments/${commentId}`, data);
    return response.data.data;
  },

  // Xóa bình luận
  async deleteComment(commentId: string): Promise<void> {
    await apiClient.delete(`/comments/${commentId}`);
  },
};
