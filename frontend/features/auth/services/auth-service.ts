import { apiClient } from '@/shared/api/client';
import { User } from '../store/auth-store';

interface BaseResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authService = {
  // 1. Đăng ký tài khoản thường
  async signup(data: any): Promise<BaseResponse<any>> {
    const res = await apiClient.post<BaseResponse<any>>('/auth/signup', data);
    return res.data;
  },

  // 2. Đăng nhập thường
  async login(data: any): Promise<BaseResponse<AuthResponse>> {
    const res = await apiClient.post<BaseResponse<AuthResponse>>('/auth/login', data);
    return res.data;
  },

  // 3. Đăng nhập Google
  async googleLogin(credential: string): Promise<BaseResponse<AuthResponse>> {
    const res = await apiClient.post<BaseResponse<AuthResponse>>('/auth/google', { credential });
    return res.data;
  },

  // 4. Lấy thông tin user hiện tại (Khôi phục phiên)
  async getMe(): Promise<BaseResponse<User>> {
    const res = await apiClient.get<BaseResponse<User>>('/auth/me');
    return res.data;
  },

  // 5. Đăng xuất
  async logout(): Promise<BaseResponse<{ message: string }>> {
    const res = await apiClient.post<BaseResponse<{ message: string }>>('/auth/logout');
    return res.data;
  },

  // 6. Quên mật khẩu
  async forgotPassword(email: string): Promise<BaseResponse<{ message: string; resetToken?: string }>> {
    const res = await apiClient.post<BaseResponse<{ message: string; resetToken?: string }>>('/auth/forgot-password', { email });
    return res.data;
  },

  // 7. Đặt lại mật khẩu
  async resetPassword(token: string, newPassword: any): Promise<BaseResponse<{ message: string }>> {
    const res = await apiClient.post<BaseResponse<{ message: string }>>('/auth/reset-password', {
      token,
      newPassword,
    });
    return res.data;
  },
};
