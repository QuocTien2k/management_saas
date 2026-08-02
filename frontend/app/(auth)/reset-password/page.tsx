import React, { Suspense } from 'react';
import ResetPasswordForm from '@/features/auth/components/reset-password-form';
import { Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  return (
    <div className="w-full flex justify-center py-4">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span>Đang tải form đặt lại mật khẩu...</span>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
