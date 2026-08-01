'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2Icon } from 'lucide-react';

export default function LegacyAcceptInvitationPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  React.useEffect(() => {
    if (token) {
      router.replace(`/workspace-invitations/accept?token=${token}`);
    } else {
      router.replace('/workspaces');
    }
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Loader2Icon className="size-5 animate-spin text-primary" />
        <span>Đang chuyển hướng đến trang lời mời...</span>
      </div>
    </div>
  );
}
