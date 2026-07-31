'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Building2Icon, CheckCircle2Icon, AlertCircleIcon, Loader2Icon } from 'lucide-react';
import { useAcceptInvitation } from '@/features/workspace/hooks/use-members';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const acceptMutation = useAcceptInvitation();
  const [accepted, setAccepted] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleAccept = async () => {
    if (!token) return;
    try {
      setErrorMessage(null);
      const res = await acceptMutation.mutateAsync({ token });
      setAccepted(true);
      setTimeout(() => {
        if (res?.workspace?.id) {
          router.push(`/workspaces/${res.workspace.id}`);
        } else {
          router.push('/workspaces');
        }
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Token lời mời không hợp lệ hoặc đã hết hạn.';
      setErrorMessage(msg);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
              <AlertCircleIcon className="size-6" />
            </div>
            <CardTitle>Lời mời không hợp lệ</CardTitle>
            <CardDescription>
              Đường dẫn lời mời thiếu mã xác thực token. Vui lòng kiểm tra lại email của bạn.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/workspaces')} className="w-full">
              Quay lại danh sách Workspace
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
            <Building2Icon className="size-7" />
          </div>
          <CardTitle className="text-xl">Lời mời tham gia Workspace</CardTitle>
          <CardDescription>
            Bạn đã nhận được lời mời tham gia không gian làm việc. Nhấn nút bên dưới để chấp nhận và bắt đầu làm việc.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {accepted && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/15 p-4 text-sm font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              <CheckCircle2Icon className="size-5 shrink-0" />
              <span>Chấp nhận lời mời thành công! Đang chuyển hướng...</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/15 p-4 text-sm font-medium text-destructive border border-destructive/30">
              <AlertCircleIcon className="size-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {!accepted && (
            <Button
              onClick={handleAccept}
              disabled={acceptMutation.isPending}
              className="w-full size-lg gap-2"
            >
              {acceptMutation.isPending ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Chấp nhận tham gia'
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => router.push('/workspaces')}
            disabled={acceptMutation.isPending}
            className="w-full"
          >
            Quay lại trang chủ
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
