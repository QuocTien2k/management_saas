import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { authService } from '@/features/auth/services/auth-service';
import { toast } from '@/lib/toast';

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuth();
      toast.success('Đã đăng xuất thành công');
      router.push('/login');
      router.refresh();
      setIsLoggingOut(false);
    }
  };

  return { logout, isLoggingOut };
}
