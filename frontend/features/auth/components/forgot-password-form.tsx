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
import { getErrorMessage } from '@/lib/error';
import { getAuthInputClass } from '@/lib/utils';
import { FormError } from '@/components/ui/form-error';

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
      toast.error(getErrorMessage(error, 'Không tìm thấy tài khoản với email này'));
    } finally {
      stopLoading();
    }
  };

  return (
    <Card className="w-full max-w-md border-border/80 bg-card/80 backdrop-blur-md shadow-xl text-card-foreground relative overflow-hidden">
      {isLoading && <Loading variant="scope" text="Đang xử lý yêu cầu..." />}
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Quên mật khẩu</CardTitle>
        <CardDescription className="text-muted-foreground">
          {isSent
            ? 'Vui lòng kiểm tra email của bạn để tiếp tục'
            : 'Nhập email liên kết với tài khoản của bạn để khôi phục mật khẩu'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSent ? (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Chúng tôi đã gửi một email chứa liên kết khôi phục mật khẩu đến địa chỉ email của bạn. Liên kết có hiệu lực trong vòng 15 phút.
              </p>
            </div>

            {resetLink && (
              <div className="p-4 rounded-xl bg-muted/50 border border-amber-500/20 text-left space-y-2">
                <div className="flex items-center gap-2 text-xs text-amber-500 font-semibold uppercase">
                  <AlertTriangle className="h-4 w-4" /> Môi trường Development
                </div>
                <p className="text-xs text-muted-foreground">
                  Phát hiện liên kết khôi phục từ backend (bạn có thể bấm để test trực tiếp):
                </p>
                <Link
                  href={resetLink}
                  className="text-xs text-primary hover:underline block break-all font-mono"
                >
                  {window.location.origin}{resetLink}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Email tài khoản</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@domain.com"
                {...register('email')}
                className={getAuthInputClass(!!errors.email)}
              />
              <FormError message={errors.email?.message} />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 transition-all cursor-pointer flex items-center justify-center gap-2 rounded-xl shadow-xs"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Gửi liên kết khôi phục
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="text-center justify-center border-t bg-muted/30 border-border/70 py-4">
        <Link
          href="/login"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại Đăng nhập
        </Link>
      </CardFooter>
    </Card>
  );
}
