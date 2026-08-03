import React from 'react';
import Link from 'next/link';
import { Kanban } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { CursorSparkles } from '@/components/ui/cursor-sparkles';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-background text-foreground transition-colors duration-200 overflow-hidden">
      <CursorSparkles />
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 size-[400px] rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none" />

      {/* Lưới grid ô vuông nền tinh tế */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.07)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none opacity-50 dark:opacity-60" />

      {/* Top Header - Distinct & Framed */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md shadow-2xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-xs transition-transform group-hover:scale-105">
              <Kanban className="size-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">ProFlow Task</span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer - Distinct & Framed */}
      <footer className="relative z-10 w-full border-t border-border/80 bg-background/80 backdrop-blur-md py-4 text-center text-xs text-muted-foreground transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 ProFlow Task. Bảo lưu mọi quyền.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">Trang chủ</Link>
            <a href="#" className="hover:text-foreground transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-foreground transition-colors">Bảo mật</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
