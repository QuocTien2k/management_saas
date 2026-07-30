'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/features/auth/services/auth-service';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { useLoading } from '@/hooks/use-loading';
import { getErrorMessage } from '@/lib/error';
import { getAuthInputClass } from '@/lib/utils';
import { FormError } from '@/components/ui/form-error';

const signupSchema = z
  .object({
    fullname: z.string().min(1, 'Họ tên không được để trống'),
    email: z.string().min(1, 'Email không được để trống').email('Email không đúng định dạng'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type SignupDto = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isLoading, startLoading, stopLoading } = useLoading(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupDto>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullname: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupDto) => {
    startLoading();
    try {
      // Loại bỏ confirmPassword trước khi gửi lên API
      const { confirmPassword, ...signupData } = data;
      const res = await authService.signup(signupData);
      if (res.success) {
        toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
        router.push('/login');
      } else {
        toast.error(res.error?.message || 'Đăng ký tài khoản thất bại');
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Có lỗi xảy ra, vui lòng thử lại sau.'));
    } finally {
      stopLoading();
    }
  };

  return (
    <Card className="w-full max-w-md border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-2xl text-slate-100 relative overflow-hidden">
      {isLoading && <Loading variant="scope" text="Đang đăng ký tài khoản..." />}
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-white">Đăng ký tài khoản</CardTitle>
        <CardDescription className="text-slate-400">
          Tạo tài khoản mới để bắt đầu quản lý dự án
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullname" className="text-slate-200">Họ và tên</Label>
            <Input
              id="fullname"
              type="text"
              placeholder="Nguyễn Văn A"
              {...register('fullname')}
              className={getAuthInputClass(!!errors.fullname)}
            />
            <FormError message={errors.fullname?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@domain.com"
              {...register('email')}
              className={getAuthInputClass(!!errors.email)}
            />
            <FormError message={errors.email?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">Mật khẩu</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={getAuthInputClass(!!errors.password, 'pr-10')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FormError message={errors.password?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-200">Xác nhận mật khẩu</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                className={getAuthInputClass(!!errors.confirmPassword, 'pr-10')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FormError message={errors.confirmPassword?.message} />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Đăng ký tài khoản
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center justify-center border-t bg-slate-800/80 border-slate-700 py-4">
        <p className="text-sm text-slate-400">
          Đã có tài khoản?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
