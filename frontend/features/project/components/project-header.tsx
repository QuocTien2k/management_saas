'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, FolderKanbanIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project } from '../types/project.types';

interface ProjectHeaderProps {
  project?: Project;
  workspaceId: string;
  onQuickCreateTask?: () => void;
}

export function ProjectHeader({ project, workspaceId, onQuickCreateTask }: ProjectHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4 mb-4">
      <div className="flex items-center gap-3">
        <Link href={`/workspaces/${workspaceId}/projects`}>
          <Button variant="ghost" size="icon" className="size-8 rounded-lg cursor-pointer">
            <ArrowLeftIcon className="size-4" />
          </Button>
        </Link>
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-mono font-bold text-xs tracking-wider">
          {project?.key || 'PRJ'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-foreground">{project?.name || 'Đang tải dự án...'}</h1>
          </div>
          {project?.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{project.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end sm:self-auto">
        {onQuickCreateTask && (
          <Button size="sm" onClick={onQuickCreateTask} className="gap-2 shadow-xs cursor-pointer">
            <PlusIcon className="size-4" />
            Tạo công việc
          </Button>
        )}
      </div>
    </div>
  );
}
