'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/features/auth/services/auth-service';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { useLoading } from '@/hooks/use-loading';

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isLoading, startLoading, stopLoading } = useLoading(false);
  const [isTokenMissing, setIsTokenMissing] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsTokenMissing(true);
      toast.error('Không tìm thấy token đặt lại mật khẩu');
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordDto>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordDto) => {
    if (!token) {
      toast.error('Token không hợp lệ');
      return;
    }
    startLoading();
    try {
      const res = await authService.resetPassword(token, data.password);
      if (res.success) {
        toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
        router.push('/login');
      } else {
        toast.error(res.error?.message || 'Đặt lại mật khẩu thất bại');
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message ||
          'Mã khôi phục mật khẩu không hợp lệ hoặc đã hết hạn'
      );
    } finally {
      stopLoading();
    }
  };

  if (isTokenMissing) {
    return (
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-2xl text-slate-100">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-rose-400 flex items-center justify-center gap-2">
            <ShieldAlert className="h-6 w-6" /> Lỗi xác thực
          </CardTitle>
          <CardDescription className="text-slate-400">
            Token khôi phục mật khẩu bị thiếu hoặc không chính xác.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6 text-sm text-slate-300">
          Vui lòng quay lại trang Quên mật khẩu để yêu cầu gửi lại email khôi phục.
        </CardContent>
        <CardFooter className="text-center justify-center border-t bg-slate-800/80 border-slate-700 py-4">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors"
          >
            Yêu cầu liên kết mới
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-2xl text-slate-100 relative overflow-hidden">
      {isLoading && <Loading variant="scope" text="Đang đặt lại mật khẩu..." />}
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-white">Đặt lại mật khẩu</CardTitle>
        <CardDescription className="text-slate-400">
          Nhập mật khẩu mới cho tài khoản của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">Mật khẩu mới</Label>
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-200">Xác nhận mật khẩu mới</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                className={`bg-slate-950/60 border-slate-800 text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                  errors.confirmPassword ? 'border-rose-500 focus:ring-rose-500' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-rose-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Cập nhật mật khẩu
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
