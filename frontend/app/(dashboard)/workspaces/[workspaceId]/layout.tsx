'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
  LayoutDashboardIcon,
  FolderKanbanIcon,
  UsersIcon,
  SettingsIcon,
  LogOutIcon,
  BellIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from 'lucide-react';

import { useWorkspaceDetail } from '@/features/workspace/hooks/use-workspace';
import { useWorkspaceStore } from '@/features/workspace/store/workspace-store';
import { WorkspaceSwitcher } from '@/features/workspace/components/workspace-switcher';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const workspaceId = params?.workspaceId as string;

  const { user } = useAuthStore();
  const { logout } = useLogout();
  const { data: workspace } = useWorkspaceDetail(workspaceId);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('workspace-sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('workspace-sidebar-collapsed', String(next));
      return next;
    });
  };

  React.useEffect(() => {
    if (workspace) {
      setActiveWorkspace(workspace);
    }
  }, [workspace, setActiveWorkspace]);

  const navItems = [
    {
      label: 'Tổng quan (Dashboard)',
      href: `/workspaces/${workspaceId}`,
      icon: LayoutDashboardIcon,
      exact: true,
    },
    {
      label: 'Dự án (Projects)',
      href: `/workspaces/${workspaceId}/projects`,
      icon: FolderKanbanIcon,
    },
    {
      label: 'Thành viên (Members)',
      href: `/workspaces/${workspaceId}/members`,
      icon: UsersIcon,
    },
    {
      label: 'Cài đặt (Settings)',
      href: `/workspaces/${workspaceId}/settings`,
      icon: SettingsIcon,
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/70 dark:bg-slate-950/70 text-foreground transition-colors duration-200">
      {/* Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col justify-between border-r border-border/80 bg-card p-3 transition-all duration-300 ease-in-out relative z-20 shadow-xs',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="space-y-5">
          {/* Top Header Logo & Toggle Button */}
          <div className={cn('flex items-center justify-between px-1', isCollapsed && 'flex-col gap-3')}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs">
                M
              </div>
              {!isCollapsed && (
                <span className="font-bold text-base tracking-tight truncate text-foreground">
                  SaaS Manage
                </span>
              )}
            </div>
            <button
              onClick={toggleSidebar}
              title={isCollapsed ? 'Mở rộng sidebar' : 'Thu nhỏ sidebar'}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              {isCollapsed ? (
                <PanelLeftOpenIcon className="size-4" />
              ) : (
                <PanelLeftCloseIcon className="size-4" />
              )}
            </button>
          </div>

          {/* Workspace Switcher */}
          <div className="px-0.5">
            <WorkspaceSwitcher isCollapsed={isCollapsed} />
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all',
                    isCollapsed ? 'justify-center px-0' : 'px-3',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:bg-accent/80 hover:text-foreground'
                  )}
                >
                  <item.icon className="size-4.5 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info Bottom */}
        <div className="border-t border-border/80 pt-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  title={`${user?.fullname || 'Tài khoản'} (${user?.email || ''})`}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl p-2 text-left text-sm hover:bg-accent focus:outline-none transition-colors cursor-pointer',
                    isCollapsed && 'justify-center p-1'
                  )}
                >
                  <Avatar className="size-8.5 shrink-0 border border-border/60 shadow-xs">
                    {user?.avatar && <AvatarImage src={user.avatar} alt={user.email} />}
                    <AvatarFallback className="text-xs font-semibold">
                      {(user?.fullname || user?.email || 'U').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="grid flex-1 text-left text-xs leading-tight overflow-hidden min-w-0">
                      <span className="truncate font-semibold text-foreground" title={user?.fullname || 'Tài khoản của tôi'}>
                        {user?.fullname || 'Tài khoản của tôi'}
                      </span>
                      <span className="truncate text-muted-foreground text-[11px]" title={user?.email}>
                        {user?.email}
                      </span>
                    </div>
                  )}
                </button>
              }
            />
            <DropdownMenuContent align={isCollapsed ? 'start' : 'end'} side={isCollapsed ? 'right' : 'top'} className="w-64 p-2 shadow-lg border border-border/80 rounded-xl">
              <div className="flex items-center gap-3 p-2 border-b border-border/60 pb-2.5 mb-1">
                <Avatar className="size-10 shrink-0 border border-border/60 shadow-xs">
                  {user?.avatar && <AvatarImage src={user.avatar} alt={user.email} />}
                  <AvatarFallback className="text-sm font-semibold">
                    {(user?.fullname || user?.email || 'U').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-semibold text-sm text-foreground truncate" title={user?.fullname || 'Tài khoản của tôi'}>
                    {user?.fullname || 'Tài khoản của tôi'}
                  </span>
                  <span className="text-xs text-muted-foreground truncate" title={user?.email}>
                    {user?.email}
                  </span>
                  {user?.role && (
                    <span className="text-[10px] font-semibold uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded w-fit mt-1">
                      {user.role}
                    </span>
                  )}
                </div>
              </div>

              <DropdownMenuItem
                onClick={() => logout()}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg p-2 cursor-pointer font-medium mt-1"
              >
                <LogOutIcon className="size-4 mr-2" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/80 bg-background/80 px-6 backdrop-blur-md dark:bg-card/80">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold tracking-tight">
              {workspace?.name || 'Workspace'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button className="relative flex size-9 items-center justify-center rounded-xl border border-border/80 bg-background/80 text-muted-foreground hover:text-foreground backdrop-blur-md transition-colors cursor-pointer dark:bg-card/80">
              <BellIcon className="size-4" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    title={`${user?.fullname || 'Tài khoản'} (${user?.email || ''})`}
                    className="flex items-center gap-2 rounded-full border border-border/80 p-1 hover:bg-accent transition-colors cursor-pointer"
                  >
                    <Avatar className="size-7.5 border border-border/60">
                      {user?.avatar && <AvatarImage src={user.avatar} />}
                      <AvatarFallback className="text-xs font-semibold">
                        {(user?.fullname || user?.email || 'U').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-64 p-2 shadow-lg border border-border/80 rounded-xl backdrop-blur-md bg-popover/95">
                <div className="flex items-center gap-3 p-2 border-b border-border/60 pb-2.5 mb-1">
                  <Avatar className="size-10 shrink-0 border border-border/60 shadow-xs">
                    {user?.avatar && <AvatarImage src={user.avatar} alt={user.email} />}
                    <AvatarFallback className="text-sm font-semibold">
                      {(user?.fullname || user?.email || 'U').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold text-sm text-foreground truncate" title={user?.fullname || 'Tài khoản của tôi'}>
                      {user?.fullname || 'Tài khoản của tôi'}
                    </span>
                    <span className="text-xs text-muted-foreground truncate" title={user?.email}>
                      {user?.email}
                    </span>
                    {user?.role && (
                      <span className="text-[10px] font-semibold uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded w-fit mt-1">
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>

                <DropdownMenuItem
                  onClick={() => logout()}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg p-2 cursor-pointer font-medium mt-1"
                >
                  <LogOutIcon className="size-4 mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
