import React from 'react';
import Link from 'next/link';
import { ArrowRight, Kanban, Shield, Zap, Users, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      {/* Hiệu ứng phát sáng nền */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none"></div>

      {/* Lưới grid nền */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-40"></div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900/60">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Kanban className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Antigravity Task</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Đăng nhập
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-blue-600 hover:bg-blue-505 text-white px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-blue-500/20"
          >
            Đăng ký miễn phí
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center py-20 lg:py-32">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8 animate-pulse">
          <Zap className="h-3.5 w-3.5" /> Giải pháp quản lý dự án thế hệ mới
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-3xl leading-[1.15] mb-6">
          Quản lý công việc và dự án <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">tối ưu hơn</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Đơn giản hóa quy trình cộng tác, theo dõi tiến độ công việc trên Kanban board thời gian thực và thúc đẩy năng suất của toàn bộ đội ngũ.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center mb-20">
          <Link
            href="/signup"
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-base font-semibold bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl transition-all shadow-xl hover:shadow-blue-500/30 cursor-pointer"
          >
            Bắt đầu sử dụng <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center text-base font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 px-8 py-4 rounded-xl transition-all cursor-pointer"
          >
            Xem bản demo
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
          <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/30 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Kanban className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Bảng Kanban kéo thả</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Trực quan hóa công việc theo cột trạng thái. Di chuyển các công việc dễ dàng với kéo thả mượt mà.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/30 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Cộng tác thời gian thực</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Mọi thay đổi của thành viên khác về công việc, bình luận sẽ được cập nhật tức thì qua WebSocket.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/30 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Phân quyền chuyên sâu</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Quản lý vai trò (Owner, Admin, Member) và dữ liệu độc lập theo từng không gian làm việc (Workspace).
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 mt-auto">
        <p>© 2026 Antigravity Task. Bảo lưu mọi quyền.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-400 transition-colors">Điều khoản</a>
          <a href="#" className="hover:text-slate-400 transition-colors">Bảo mật</a>
          <a href="#" className="hover:text-slate-400 transition-colors">Liên hệ</a>
        </div>
      </footer>
    </div>
  );
}
