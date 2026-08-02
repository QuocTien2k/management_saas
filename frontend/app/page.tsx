import React from 'react';
import Link from 'next/link';
import { ArrowRight, Kanban, Shield, Zap, Users } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { CursorSparkles } from '@/components/ui/cursor-sparkles';

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col overflow-hidden transition-colors duration-200">
      <CursorSparkles />
      {/* Hiệu ứng phát sáng nền */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 size-[500px] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none"></div>

      {/* Lưới grid ô vuông nền tinh tế */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.07)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none opacity-50 dark:opacity-60"></div>

      {/* Header - Sticky & Distinct */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md shadow-2xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-xs">
              <Kanban className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Antigravity Task</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Đăng nhập
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Đăng ký miễn phí
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center py-20 lg:py-32">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-8 animate-pulse">
          <Zap className="h-3.5 w-3.5" /> Giải pháp quản lý dự án thế hệ mới
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold text-foreground tracking-tight max-w-3xl leading-[1.15] mb-6">
          Quản lý công việc và dự án <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">tối ưu hơn</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Đơn giản hóa quy trình cộng tác, theo dõi tiến độ công việc trên Kanban board thời gian thực và thúc đẩy năng suất của toàn bộ đội ngũ.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center mb-20">
          <Link
            href="/signup"
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl transition-all shadow-lg cursor-pointer"
          >
            Bắt đầu sử dụng <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center text-base font-semibold bg-card hover:bg-muted/80 border border-border text-foreground px-8 py-4 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Xem bản demo
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
          <div className="p-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-xs hover:border-primary/40 transition-all">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-4">
              <Kanban className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Bảng Kanban kéo thả</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Trực quan hóa công việc theo cột trạng thái. Di chuyển các công việc dễ dàng với kéo thả mượt mà.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-xs hover:border-indigo/40 transition-all">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Cộng tác thời gian thực</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mọi thay đổi của thành viên khác về công việc, bình luận sẽ được cập nhật tức thì qua WebSocket.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-xs hover:border-emerald/40 transition-all">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Phân quyền chuyên sâu</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Quản lý vai trò (Owner, Admin, Member) và dữ liệu độc lập theo từng không gian làm việc (Workspace).
            </p>
          </div>
        </div>
      </main>

      {/* Footer - Distinct & Framed */}
      <footer className="relative z-10 w-full border-t border-border/80 bg-background/80 backdrop-blur-md py-6 text-xs text-muted-foreground transition-colors duration-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Antigravity Task. Bảo lưu mọi quyền.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-foreground transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-foreground transition-colors">Liên hệ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
