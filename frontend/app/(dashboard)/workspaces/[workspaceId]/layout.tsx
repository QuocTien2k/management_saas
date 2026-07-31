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
  UserIcon,
} from 'lucide-react';

import { useWorkspaceDetail } from '@/features/workspace/hooks/use-workspace';
import { useWorkspaceStore } from '@/features/workspace/store/workspace-store';
import { WorkspaceSwitcher } from '@/features/workspace/components/workspace-switcher';
import { useAuthStore } from '@/features/auth/store/auth-store';
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

  const { user, clearAuth } = useAuthStore();
  const { data: workspace } = useWorkspaceDetail(workspaceId);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

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
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-background p-4 flex flex-col justify-between hidden md:flex dark:bg-card">
        <div className="space-y-6">
          {/* Top Logo / App name */}
          <div className="flex items-center gap-2 px-1">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
              M
            </div>
            <span className="font-bold text-lg tracking-tight">SaaS Manage</span>
          </div>

          {/* Workspace Switcher */}
          <WorkspaceSwitcher />

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
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info Bottom */}
        <div className="border-t border-border pt-4">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-sm hover:bg-accent focus:outline-none transition-colors cursor-pointer">
                  <Avatar className="size-8">
                    {user?.avatar && <AvatarImage src={user.avatar} alt={user.email} />}
                    <AvatarFallback>
                      {(user?.fullname || user?.email || 'U').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight">
                    <span className="truncate font-semibold text-foreground">
                      {user?.fullname || 'Tài khoản của tôi'}
                    </span>
                    <span className="truncate text-muted-foreground">{user?.email}</span>
                  </div>
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => clearAuth()} className="text-destructive focus:text-destructive cursor-pointer">
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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md dark:bg-card/80">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold">
              {workspace?.name || 'Workspace'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-background/80 text-muted-foreground hover:text-foreground backdrop-blur-md transition-colors cursor-pointer dark:bg-card/80">
              <BellIcon className="size-4" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="flex items-center gap-2 rounded-full border border-border p-1 hover:bg-accent transition-colors cursor-pointer">
                    <Avatar className="size-7">
                      {user?.avatar && <AvatarImage src={user.avatar} />}
                      <AvatarFallback>
                        {(user?.fullname || user?.email || 'U').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="backdrop-blur-md bg-popover/90 border border-border/80">
                <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => clearAuth()} className="text-destructive cursor-pointer">
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
