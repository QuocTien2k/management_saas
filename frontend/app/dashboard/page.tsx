'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { authService } from '@/features/auth/services/auth-service';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User as UserIcon, Shield, Mail, Calendar, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      clearAuth();
      toast.success('Đăng xuất thành công');
      router.push('/login');
      router.refresh();
    } catch (error) {
      // Dù API logout lỗi thì ta vẫn clear client auth để đảm bảo trải nghiệm người dùng
      clearAuth();
      toast.success('Đăng xuất thành công');
      router.push('/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 px-4 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>

      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-50"></div>

      <div className="relative z-10 w-full max-w-xl">
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-2xl text-slate-100">
          <CardHeader className="border-b border-slate-800/60 pb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 overflow-hidden shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-8 w-8" />
                )}
              </div>
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight text-white">
                  {user?.fullname || 'Thành viên'}
                </CardTitle>
                <CardDescription className="text-slate-400 flex items-center gap-1.5 mt-1">
                  <Shield className="h-3.5 w-3.5 text-blue-400" />
                  Quyền hạn: <span className="font-semibold text-slate-200">{user?.role}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
                <Mail className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Địa chỉ Email</p>
                  <p className="text-sm font-semibold text-slate-200">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
                <UserIcon className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Mã số định danh (User ID)</p>
                  <p className="text-sm font-mono text-slate-300 break-all">{user?.id}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-800/40 justify-end py-4">
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="destructive"
              className="bg-rose-600 hover:bg-rose-500 text-white gap-2 flex items-center cursor-pointer"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Đăng xuất
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
