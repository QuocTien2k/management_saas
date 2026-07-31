import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { useWorkspaceStore } from '@/features/workspace/store/workspace-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Cờ và hàng đợi phục vụ Token Rotation (Refresh Token)
let isRefreshing = false;
let failedRequestsQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

// Xử lý các request trong hàng đợi sau khi refresh token thành công
const processQueue = (error: any, token: string | null = null) => {
  failedRequestsQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedRequestsQueue = [];
};

// Instance chính dùng cho các API thông thường
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Quan trọng để gửi/nhận Cookie chứa Refresh Token
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Đính kèm Access Token & Active Workspace ID vào Header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    const activeWorkspaceId = useWorkspaceStore.getState().activeWorkspaceId;
    if (activeWorkspaceId && config.headers) {
      config.headers['x-workspace-id'] = activeWorkspaceId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Tự động xử lý Refresh Token khi gặp lỗi 401
apiClient.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp data để tiện xử lý ở UI (tùy thuộc sở thích, hoặc trả về response gốc)
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Nếu gặp lỗi 403 Forbidden (Không có quyền truy cập)
    if (error.response?.status === 403 && typeof window !== 'undefined') {
      if (window.location.pathname !== '/403') {
        window.location.href = '/403';
      }
      return Promise.reject(error);
    }

    // Nếu không có response hoặc mã lỗi không phải là 401 Unauthorized
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Tránh vòng lặp vô hạn khi chính API /auth/refresh hoặc đăng nhập/đăng ký bị trả về 401
    const isAuthUrl =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/signup') ||
      originalRequest.url?.includes('/auth/forgot-password') ||
      originalRequest.url?.includes('/auth/reset-password');

    if (isAuthUrl) {
      return Promise.reject(error);
    }

    // Nếu đã đánh dấu retry trước đó (đã refresh nhưng vẫn lỗi)
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Nếu đang có một tiến trình refresh token khác đang chạy
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          },
          reject: (err: any) => {
            reject(err);
          },
        });
      });
    }

    isRefreshing = true;

    try {
      // Gọi API refresh token (không dùng apiClient để tránh kích hoạt lại interceptors)
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const { user, accessToken } = response.data.data;

      // Cập nhật token mới vào Zustand store
      useAuthStore.getState().setAuth(user, accessToken);

      // Chạy tiếp các request đang đợi trong queue
      processQueue(null, accessToken);

      // Cập nhật token cho request hiện tại và thực thi lại
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      isRefreshing = false;
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Nếu refresh token thất bại (đã hết hạn hoàn toàn, bị thu hồi, v.v.)
      processQueue(refreshError, null);
      useAuthStore.getState().clearAuth();

      // Chỉ thực hiện chuyển hướng về login khi đang chạy ở trình duyệt
      // và người dùng đang ở một trang yêu cầu xác thực (protected routes).
      if (typeof window !== 'undefined') {
        const protectedRoutes = ['/dashboard', '/projects', '/workspaces', '/settings'];
        const isProtectedRoute = protectedRoutes.some((route) => window.location.pathname.startsWith(route));
        
        if (isProtectedRoute && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      isRefreshing = false;
      return Promise.reject(refreshError);
    }
  }
);
