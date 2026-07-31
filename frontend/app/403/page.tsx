'use client';

import * as React from 'react';
import { Forbidden } from '@/components/ui/forbidden';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full bg-rose-600/15 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 size-[400px] rounded-full bg-amber-600/15 blur-[140px] pointer-events-none" />

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-30" />

      <div className="relative z-10 w-full max-w-xl">
        <Forbidden />
      </div>
    </div>
  );
}
