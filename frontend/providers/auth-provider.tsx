'use client';

import { usePathname } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { authService } from '@/features/auth/services/auth-service';

import { Loading } from '@/components/ui/loading';

interface AuthContextType {
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType>({ isInitializing: true });

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const pathname = usePathname();

  useEffect(() => {
    const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    if (isAuthRoute) {
      setIsInitializing(false);
      return;
    }

    const initializeAuth = async () => {
      try {
        // Gọi API lấy thông tin me.
        // Nếu ban đầu accessToken ở client trống, API sẽ trả về 401.
        // Interceptor của apiClient sẽ bắt lỗi 401, gọi /auth/refresh để lấy accessToken mới,
        // sau đó retry thành công và trả về thông tin user.
        const res = await authService.getMe();
        if (res.success && res.data) {
          // Trạng thái đã được setAuth ở interceptor rồi,
          // nhưng ta ghi nhận lại cho chắc chắn.
          const currentToken = useAuthStore.getState().accessToken;
          if (currentToken) {
            setAuth(res.data, currentToken);
          }
        }
      } catch (error) {
        // Lỗi xảy ra có nghĩa là Refresh Token hết hạn hoặc chưa đăng nhập.
        clearAuth();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [pathname, setAuth, clearAuth]);

  if (isInitializing) {
    return <Loading variant="global" text="Đang tải dữ liệu xác thực..." size="lg" />;
  }

  return (
    <AuthContext.Provider value={{ isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
}
