'use client';

import * as React from 'react';
import Link from 'next/link';
import { FolderKanbanIcon, CheckCircle2Icon, ClockIcon, ArrowRightIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, ProjectStatus } from '../types/project.types';

interface ProjectCardProps {
  project: Project;
  workspaceId: string;
}

const statusMap: Record<ProjectStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; bg: string }> = {
  PLANNING: { label: 'Lên kế hoạch', variant: 'outline', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  IN_PROGRESS: { label: 'Đang làm', variant: 'default', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  COMPLETED: { label: 'Hoàn thành', variant: 'secondary', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  ARCHIVED: { label: 'Đã lưu trữ', variant: 'outline', bg: 'bg-muted text-muted-foreground' },
};

export function ProjectCard({ project, workspaceId }: ProjectCardProps) {
  const statusInfo = statusMap[project.status] || statusMap.IN_PROGRESS;

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden border-border/80 hover:border-border hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold font-mono text-sm tracking-wider">
              {project.key}
            </div>
            <div>
              <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                <Link href={`/workspaces/${workspaceId}/projects/${project.id}`}>
                  <span className="absolute inset-0" />
                  {project.name}
                </Link>
              </CardTitle>
              <div className="mt-1 flex items-center gap-2">
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border ${statusInfo.bg}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <CardDescription className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
          {project.description || 'Chưa có mô tả chi tiết cho dự án này.'}
        </CardDescription>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-medium text-foreground/80">
          <FolderKanbanIcon className="size-3.5 text-muted-foreground" />
          <span>{project._count?.tasks ?? 0} công việc</span>
        </div>

        <div className="flex items-center gap-1 text-primary text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          Xem bảng Kanban <ArrowRightIcon className="size-3.5" />
        </div>
      </CardFooter>
    </Card>
  );
}
