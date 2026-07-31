'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { PlusIcon, FolderKanbanIcon, Loader2Icon, SearchIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProjects } from '@/features/project/hooks/use-projects';
import { ProjectCard } from '@/features/project/components/project-card';
import { CreateProjectDialog } from '@/features/project/components/create-project-dialog';

export default function WorkspaceProjectsPage() {
  const params = useParams();
  const workspaceId = params?.workspaceId as string;

  const { data: projects, isLoading } = useProjects(workspaceId);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredProjects = React.useMemo(() => {
    if (!projects) return [];
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.key.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
  }, [projects, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Dự án trong Workspace</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý tất cả các bảng dự án và tiến độ công việc của nhóm.
          </p>
        </div>

        <Button
          onClick={() => setCreateDialogOpen(true)}
          size="sm"
          className="gap-2 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <PlusIcon className="size-4" />
          Tạo Dự án mới
        </Button>
      </div>

      {/* Toolbar & Search */}
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-xs">
          <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên hoặc mã dự án..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-8 text-xs bg-background"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2Icon className="size-6 animate-spin text-primary mr-2" /> Đang tải danh sách dự án...
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} workspaceId={workspaceId} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border/80 rounded-xl text-center bg-muted/20">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
            <FolderKanbanIcon className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Chưa có dự án nào</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Bắt đầu tổ chức công việc bằng cách tạo dự án đầu tiên cho Workspace của bạn.
          </p>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            size="sm"
            className="mt-4 gap-2 shadow-xs cursor-pointer"
          >
            <PlusIcon className="size-4" />
            Tạo Dự án mới
          </Button>
        </div>
      )}

      {/* Modal tạo dự án */}
      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        workspaceId={workspaceId}
      />
    </div>
  );
}
