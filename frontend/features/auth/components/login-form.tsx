'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { authService } from '@/features/auth/services/auth-service';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { useLoading } from '@/hooks/use-loading';

const loginSchema = z.object({
  email: z.string().min(1, 'Email không được để trống').email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export type LoginDto = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, startLoading, stopLoading } = useLoading(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Xử lý đăng nhập thông thường
  const onSubmit = async (data: LoginDto) => {
    startLoading();
    try {
      const res = await authService.login(data);
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.accessToken);
        toast.success(`Đăng nhập thành công! Chào mừng ${res.data.user.fullname}`);
        router.push(callbackUrl);
        router.refresh();
      } else {
        toast.error(res.error?.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Email hoặc mật khẩu không chính xác'
      );
    } finally {
      stopLoading();
    }
  };

  // Xử lý callback từ Google One Tap / Google Button
  const handleGoogleResponse = async (response: any) => {
    setIsGoogleLoading(true);
    try {
      const res = await authService.googleLogin(response.credential);
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.accessToken);
        toast.success(`Đăng nhập Google thành công! Chào mừng ${res.data.user.fullname}`);
        router.push(callbackUrl);
        router.refresh();
      } else {
        toast.error(res.error?.message || 'Đăng nhập Google thất bại');
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Không thể liên kết tài khoản Google'
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Load Google Client SDK khi client mounts
  useEffect(() => {
    const googleClientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      '336184599171-3s20pgu4nf7k829jqoulsi2hv0fmpiki.apps.googleusercontent.com';

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if ((window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse,
        });

        (window as any).google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          {
            theme: 'filled_blue',
            size: 'large',
            width: 320,
            text: 'signin_with',
            shape: 'rectangular',
          }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <Card className="w-full max-w-md border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-2xl text-slate-100 relative overflow-hidden">
      {(isLoading || isGoogleLoading) && (
        <Loading
          variant="scope"
          text={isGoogleLoading ? 'Đang xác thực Google...' : 'Đang đăng nhập...'}
        />
      )}
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-white">Đăng nhập</CardTitle>
        <CardDescription className="text-slate-400">
          Nhập tài khoản của bạn để truy cập hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@domain.com"
              {...register('email')}
              className={`bg-slate-950/60 border-slate-800 text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-rose-500 focus:ring-rose-500' : ''
              }`}
            />
            {errors.email && (
              <p className="text-xs text-rose-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-200">Mật khẩu</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={`bg-slate-950/60 border-slate-800 text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                  errors.password ? 'border-rose-500 focus:ring-rose-500' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-rose-400">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Đăng nhập
          </Button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase font-medium">Hoặc tiếp tục với</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[44px]">
          {isGoogleLoading ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              Đang xác thực Google...
            </div>
          ) : (
            <div id="google-signin-btn" className="w-full flex justify-center"></div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-center justify-center border-t bg-slate-800/80 border-slate-700 py-4">
        <p className="text-sm text-slate-400">
          Chưa có tài khoản?{' '}
          <Link
            href="/signup"
            className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors"
          >
            Đăng ký ngay
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
