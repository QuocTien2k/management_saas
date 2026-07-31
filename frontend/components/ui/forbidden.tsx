'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlertIcon, ArrowLeftIcon, Building2Icon, LockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ForbiddenProps {
  title?: string;
  description?: string;
  showHomeButton?: boolean;
}

export function Forbidden({
  title = 'Truy cập bị từ chối',
  description = 'Bạn không có quyền truy cập vào không gian làm việc hoặc tài nguyên này. Vui lòng liên hệ quản trị viên nếu bạn tin rằng đây là một sự nhầm lẫn.',
  showHomeButton = true,
}: ForbiddenProps) {
  const router = useRouter();

  return (
    <div className="relative flex min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden p-6 text-center">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-rose-500/10 blur-[130px] pointer-events-none" />

      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center">
        {/* Shield Icon Badge */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shadow-xl backdrop-blur-md dark:bg-rose-500/20">
            <ShieldAlertIcon className="size-10 stroke-[1.75]" />
          </div>
          <div className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-rose-600 text-white shadow-md border-2 border-background">
            <LockIcon className="size-3.5" />
          </div>
        </div>

        {/* 403 Code Badge */}
        <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 mb-3">
          403 Forbidden
        </span>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>

        <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full sm:w-auto gap-2 cursor-pointer shadow-xs"
          >
            <ArrowLeftIcon className="size-4" />
            Quay lại
          </Button>

          {showHomeButton && (
            <Link href="/workspaces" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto gap-2 shadow-sm cursor-pointer bg-rose-600 hover:bg-rose-500 text-white">
                <Building2Icon className="size-4" />
                Về Workspaces
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
