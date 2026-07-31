'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HomeIcon, Building2Icon, ArrowLeftIcon, FileQuestionIcon, SparklesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-slate-950 text-slate-100 p-6">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full bg-blue-600/15 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 size-[400px] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none" />
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-30" />

      <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center text-center">
        {/* 404 Animated Badge */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="flex size-24 items-center justify-center rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-2xl backdrop-blur-md">
            <FileQuestionIcon className="size-12 stroke-[1.5]" />
          </div>
          <div className="absolute -top-2 -right-2 flex items-center gap-1 rounded-full bg-blue-600/20 border border-blue-500/30 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-blue-300 backdrop-blur-md">
            <SparklesIcon className="size-3 text-blue-400" />
            404 Error
          </div>
        </div>

        {/* Large 404 Text Gradient */}
        <h1 className="text-7xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent sm:text-8xl">
          404
        </h1>

        <h2 className="mt-3 text-2xl font-bold text-white tracking-tight sm:text-3xl">
          Trang không tồn tại
        </h2>

        <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-md">
          Trang bạn đang tìm kiếm có thể đã bị xóa, thay đổi đường dẫn hoặc tính năng này hiện đang được phát triển.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full sm:w-auto gap-2 border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white cursor-pointer py-5 shadow-lg"
          >
            <ArrowLeftIcon className="size-4" />
            Quay lại
          </Button>

          <Link href="/workspaces" className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium cursor-pointer py-5 shadow-xl shadow-blue-600/20"
            >
              <Building2Icon className="size-4" />
              Về Workspaces
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto gap-2 border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white cursor-pointer py-5 shadow-lg"
            >
              <HomeIcon className="size-4" />
              Trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
