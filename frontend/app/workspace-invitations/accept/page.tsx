'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UsersIcon,
  CheckCircle2Icon,
  XCircleIcon,
  Loader2Icon,
  ArrowRightIcon,
  LogInIcon,
  UserPlusIcon,
} from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/auth-store';
import { memberService } from '@/features/workspace/services/member-service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const { isAuthenticated, user } = useAuthStore();

  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [joinedWorkspace, setJoinedWorkspace] = React.useState<any>(null);

  const hasAttemptedRef = React.useRef(false);

  React.useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Link mời không hợp lệ hoặc thiếu mã token xác thực.');
      return;
    }

    if (!isAuthenticated) {
      sessionStorage.setItem('pending_invite_token', token);
      return;
    }

    if (hasAttemptedRef.current) return;
    hasAttemptedRef.current = true;

    async function handleAccept() {
      setStatus('loading');
      try {
        const result = await memberService.acceptInvitation({ token: token! });
        setStatus('success');
        setJoinedWorkspace(result.workspace);
        sessionStorage.removeItem('pending_invite_token');
      } catch (err: any) {
        console.error('Accept invitation error:', err);
        setStatus('error');
        setErrorMessage(
          err?.response?.data?.error?.message ||
            err?.response?.data?.message ||
            'Lời mời đã hết hạn hoặc bạn đã tham gia Workspace này rồi.'
        );
      }
    }

    handleAccept();
  }, [token, isAuthenticated]);

  // Giao diện khi người dùng chưa đăng nhập
  if (!isAuthenticated) {
    const callbackUrl = encodeURIComponent(`/workspace-invitations/accept?token=${token || ''}`);
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
        <Card className="w-full max-w-md shadow-xl border-border/80 text-center rounded-2xl overflow-hidden">
          <CardHeader className="pt-8 pb-4 px-6">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-inner">
              <UsersIcon className="size-7" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              Lời mời tham gia Workspace
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xs mx-auto">
              Bạn được mời tham gia làm việc chung trong nhóm. Vui lòng đăng nhập hoặc đăng ký tài khoản để tiếp tục.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-2 flex flex-col gap-3.5">
            <Link href={`/login?callbackUrl=${callbackUrl}`} className="w-full">
              <Button className="w-full h-10 text-sm font-semibold gap-2 shadow-xs cursor-pointer">
                <LogInIcon className="size-4" />
                Đăng nhập để nhận lời mời
              </Button>
            </Link>
            <Link href={`/register?callbackUrl=${callbackUrl}`} className="w-full">
              <Button variant="outline" className="w-full h-10 text-sm font-semibold gap-2 shadow-xs cursor-pointer">
                <UserPlusIcon className="size-4 text-muted-foreground" />
                Tạo tài khoản mới
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/80 text-center rounded-2xl overflow-hidden">
        {status === 'loading' && (
          <CardContent className="py-14 px-6 space-y-4">
            <Loader2Icon className="mx-auto size-10 animate-spin text-primary" />
            <h3 className="text-lg font-bold text-foreground">Đang xử lý lời mời...</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Hệ thống đang thêm tài khoản vào Workspace. Vui lòng chờ trong giây lát.
            </p>
          </CardContent>
        )}

        {status === 'success' && (
          <>
            <CardHeader className="pt-8 pb-4 px-6">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4 shadow-inner">
                <CheckCircle2Icon className="size-7" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                Tham gia thành công!
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xs mx-auto">
                Tài khoản <strong className="text-foreground">{user?.email}</strong> đã trở thành thành viên chính thức của Workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <Button
                onClick={() => {
                  const wsId = joinedWorkspace?.id || joinedWorkspace?.workspaceId;
                  if (wsId) {
                    router.push(`/workspaces/${wsId}`);
                  } else {
                    router.push('/workspaces');
                  }
                }}
                className="w-full h-10 text-sm font-semibold gap-2 shadow-xs cursor-pointer"
              >
                Chuyển đến Workspace ngay <ArrowRightIcon className="size-4" />
              </Button>
            </CardContent>
          </>
        )}

        {status === 'error' && (
          <>
            <CardHeader className="pt-8 pb-4 px-6">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4 shadow-inner">
                <XCircleIcon className="size-7" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                Không thể nhận lời mời
              </CardTitle>
              <CardDescription className="text-sm text-destructive font-medium mt-2 leading-relaxed max-w-xs mx-auto">
                {errorMessage || 'Lời mời không hợp lệ hoặc đã hết hạn.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <Link href="/workspaces" className="w-full">
                <Button variant="outline" className="w-full h-10 text-sm font-semibold gap-2 shadow-xs cursor-pointer">
                  Về danh sách Workspace
                </Button>
              </Link>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
