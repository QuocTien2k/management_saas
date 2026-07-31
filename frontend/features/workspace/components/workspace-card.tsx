import * as React from 'react';
import Link from 'next/link';
import { UsersIcon, FolderKanbanIcon, ChevronRightIcon } from 'lucide-react';
import { Workspace } from '../types/workspace';
import { WorkspaceAvatar } from './workspace-avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WorkspaceCardProps {
  workspace: Workspace;
  currentUserId?: string;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <Link href={`/workspaces/${workspace.id}`} className="group block">
      <Card className="h-full border border-border transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 dark:bg-card">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div className="flex items-center gap-3">
            <WorkspaceAvatar name={workspace.name} logoUrl={workspace.logoUrl} size="lg" />
            <div>
              <CardTitle className="group-hover:text-primary transition-colors text-base font-semibold">
                {workspace.name}
              </CardTitle>
              {workspace.description && (
                <CardDescription className="line-clamp-1 text-xs mt-0.5">
                  {workspace.description}
                </CardDescription>
              )}
            </div>
          </div>
          <ChevronRightIcon className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </CardHeader>

        <CardContent className="pt-2">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <UsersIcon className="size-3.5" />
              <span>{workspace._count?.members || 1} thành viên</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FolderKanbanIcon className="size-3.5" />
              <span>{workspace._count?.projects || 0} dự án</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
