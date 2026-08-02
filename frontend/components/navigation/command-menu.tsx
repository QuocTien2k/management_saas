'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  SearchIcon,
  FolderKanbanIcon,
  UsersIcon,
  SettingsIcon,
} from 'lucide-react';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useProjects } from '@/features/project/hooks/use-projects';
import { useWorkspaceMembers } from '@/features/workspace/hooks/use-members';

interface CommandMenuProps {
  workspaceId?: string;
}

export function CommandMenu({ workspaceId }: CommandMenuProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const { data: projects } = useProjects(workspaceId);
  const { data: members } = useWorkspaceMembers(workspaceId);

  // Global key listener for Ctrl+K or Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredProjects = React.useMemo(() => {
    if (!projects) return [];
    if (!search.trim()) return projects.slice(0, 5);
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [projects, search]);

  const filteredMembers = React.useMemo(() => {
    if (!members) return [];
    if (!search.trim()) return members.slice(0, 4);
    return members.filter(
      (m) =>
        m.user?.fullname?.toLowerCase().includes(search.toLowerCase()) ||
        m.user?.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search]);

  const navigateTo = (url: string) => {
    setOpen(false);
    setSearch('');
    router.push(url);
  };

  return (
    <>
      {/* Search trigger button rendered in header */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-between w-48 sm:w-64 h-9 px-3 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/50 text-muted-foreground transition-colors cursor-pointer text-xs group"
      >
        <div className="flex items-center gap-2">
          <SearchIcon className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span>Tìm kiếm nhanh...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-80">
          <span className="text-[10px]">Ctrl</span>K
        </kbd>
      </button>

      {/* Global Command Palette Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-2xl border-border/80 shadow-2xl gap-0">
          <div className="flex items-center px-4 border-b border-border/60 bg-muted/20">
            <SearchIcon className="size-4 text-muted-foreground mr-2 shrink-0" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nhập tên dự án, thành viên hoặc lối tắt..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-12 bg-transparent px-0"
              autoFocus
            />
          </div>

          <div className="max-h-96 overflow-y-auto p-2 space-y-4 text-xs">
            {/* Lối tắt nhanh */}
            {!search && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                  Lối tắt nhanh
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {workspaceId && (
                    <>
                      <button
                        onClick={() => navigateTo(`/workspaces/${workspaceId}/projects`)}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/70 text-left cursor-pointer transition-colors"
                      >
                        <FolderKanbanIcon className="size-4 text-blue-500" />
                        <span className="font-medium text-foreground">Xem tất cả Dự án</span>
                      </button>
                      <button
                        onClick={() => navigateTo(`/workspaces/${workspaceId}/members`)}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/70 text-left cursor-pointer transition-colors"
                      >
                        <UsersIcon className="size-4 text-indigo-500" />
                        <span className="font-medium text-foreground">Quản lý Thành viên</span>
                      </button>
                      <button
                        onClick={() => navigateTo(`/workspaces/${workspaceId}/settings`)}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/70 text-left cursor-pointer transition-colors"
                      >
                        <SettingsIcon className="size-4 text-emerald-500" />
                        <span className="font-medium text-foreground">Cài đặt Workspace</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Dự án */}
            {filteredProjects.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                  Dự án ({filteredProjects.length})
                </span>
                <div className="space-y-0.5">
                  {filteredProjects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => navigateTo(`/workspaces/${workspaceId || p.workspaceId}/projects/${p.id}`)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-primary/10 text-left cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="size-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: p.color || '#3b82f6' }}
                        />
                        <span className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {p.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-md">
                        {p.status || 'ACTIVE'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Thành viên */}
            {filteredMembers.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                  Thành viên ({filteredMembers.length})
                </span>
                <div className="space-y-0.5">
                  {filteredMembers.map((m) => (
                    <div
                      key={m.id}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                          {(m.user?.fullname || m.user?.email || 'U').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="font-semibold text-foreground text-xs truncate">
                            {m.user?.fullname || 'Thành viên'}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate">{m.user?.email}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
