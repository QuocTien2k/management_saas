'use client';

import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2Icon, FolderKanbanIcon } from 'lucide-react';

import { useProjectDetail } from '@/features/project/hooks/use-projects';
import { useWorkspaceMembers } from '@/features/workspace/hooks/use-members';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { ProjectHeader } from '@/features/project/components/project-header';
import { useProjectTasks } from '@/features/task/hooks/use-tasks';
import { useTaskSocket } from '@/features/task/hooks/use-task-socket';
import { KanbanBoard } from '@/features/task/components/kanban/kanban-board';
import { TaskFiltersBar } from '@/features/task/components/filter/task-filters';
import { CreateTaskDialog } from '@/features/task/components/modal/create-task-dialog';
import { TaskDetailModal } from '@/features/task/components/modal/task-detail-modal';
import { Task, TaskFilters, TaskStatus } from '@/features/task/types/task.types';

export default function ProjectBoardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const workspaceId = params?.workspaceId as string;
  const projectId = params?.projectId as string;
  const taskIdParam = searchParams.get('taskId');

  useTaskSocket(projectId);

  const { user } = useAuthStore();
  const { data: project, isLoading: isProjectLoading } = useProjectDetail(projectId);
  const { data: members } = useWorkspaceMembers(workspaceId);

  const currentMember = React.useMemo(() => {
    if (!members || !user?.id) return null;
    return members.find((m) => m.userId === user.id || m.user.id === user.id);
  }, [members, user?.id]);

  const canCreateTask = currentMember?.role === 'OWNER' || currentMember?.role === 'ADMIN';

  const [filters, setFilters] = React.useState<TaskFilters>({});
  const { data: tasks, isLoading: isTasksLoading } = useProjectTasks(projectId, filters);

  const [createTaskOpen, setCreateTaskOpen] = React.useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = React.useState<TaskStatus>('TODO');

  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (taskIdParam) {
      setSelectedTaskId(taskIdParam);
      setDetailModalOpen(true);
    }
  }, [taskIdParam]);

  const handleQuickCreateTask = (status: TaskStatus = 'TODO') => {
    setCreateDefaultStatus(status);
    setCreateTaskOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
    setDetailModalOpen(true);
  };

  const memberOptions = React.useMemo(() => {
    if (!members) return [];
    return members.map((m) => ({
      id: m.user.id,
      fullname: m.user.fullname || m.user.email,
      email: m.user.email,
      avatar: m.user.avatar,
    }));
  }, [members]);

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Project Header */}
      <ProjectHeader
        project={project}
        workspaceId={workspaceId}
        onQuickCreateTask={canCreateTask ? () => handleQuickCreateTask('TODO') : undefined}
      />

      {/* Task Filter Bar */}
      <TaskFiltersBar
        filters={filters}
        onFilterChange={setFilters}
        members={memberOptions}
      />

      {/* Kanban Board View */}
      {isProjectLoading || isTasksLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2Icon className="size-6 animate-spin text-primary mr-2" /> Đang tải bảng công việc...
        </div>
      ) : (
        <div className="flex-1">
          <KanbanBoard
            projectId={projectId}
            tasks={tasks || []}
            currentUserId={user?.id}
            currentUserRole={currentMember?.role}
            onTaskClick={handleTaskClick}
            onQuickCreateTask={canCreateTask ? handleQuickCreateTask : undefined}
          />
        </div>
      )}

      {/* Modal Tạo công việc */}
      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        projectId={projectId}
        defaultStatus={createDefaultStatus}
        members={memberOptions}
      />

      {/* Modal Chi tiết công việc & Comment */}
      <TaskDetailModal
        taskId={selectedTaskId}
        projectId={projectId}
        workspaceId={workspaceId}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        members={memberOptions}
      />
    </div>
  );
}
