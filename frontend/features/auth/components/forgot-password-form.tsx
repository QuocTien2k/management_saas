'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { authService } from '@/features/auth/services/auth-service';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Mail, AlertTriangle } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { useLoading } from '@/hooks/use-loading';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email không được để trống').email('Email không đúng định dạng'),
});

type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const { isLoading, startLoading, stopLoading } = useLoading(false);
  const [isSent, setIsSent] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordDto>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordDto) => {
    startLoading();
    try {
      const res = await authService.forgotPassword(data.email);
      if (res.success) {
        setIsSent(true);
        toast.success('Mã khôi phục mật khẩu đã được gửi!');
        
        // Nếu ở chế độ dev và backend trả về resetToken để test nhanh
        if (res.data && res.data.resetToken) {
          setResetLink(`/reset-password?token=${res.data.resetToken}`);
        }
      } else {
        toast.error(res.error?.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Không tìm thấy tài khoản với email này'
      );
    } finally {
      stopLoading();
    }
  };

  return (
    <Card className="w-full max-w-md border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-2xl text-slate-100 relative overflow-hidden">
      {isLoading && <Loading variant="scope" text="Đang xử lý yêu cầu..." />}
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-white">Quên mật khẩu</CardTitle>
        <CardDescription className="text-slate-400">
          {isSent
            ? 'Vui lòng kiểm tra email của bạn để tiếp tục'
            : 'Nhập email liên kết với tài khoản của bạn để khôi phục mật khẩu'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSent ? (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-400">
              <Mail className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-300">
                Chúng tôi đã gửi một email chứa liên kết khôi phục mật khẩu đến địa chỉ email của bạn. Liên kết có hiệu lực trong vòng 15 phút.
              </p>
            </div>

            {resetLink && (
              <div className="p-4 rounded bg-slate-950/60 border border-amber-500/20 text-left space-y-2">
                <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase">
                  <AlertTriangle className="h-4 w-4" /> Môi trường Development
                </div>
                <p className="text-xs text-slate-400">
                  Phát hiện liên kết khôi phục từ backend (bạn có thể bấm để test trực tiếp):
                </p>
                <Link
                  href={resetLink}
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline block break-all font-mono"
                >
                  {window.location.origin}{resetLink}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email tài khoản</Label>
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

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Gửi liên kết khôi phục
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="text-center justify-center border-t bg-slate-800/80 border-slate-700 py-4">
        <Link
          href="/login"
          className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại Đăng nhập
        </Link>
      </CardFooter>
    </Card>
  );
}
