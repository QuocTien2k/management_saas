'use client';

import * as React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkspaceRole } from '@/features/workspace/types/workspace';
import { Task, TaskStatus } from '../../types/task.types';
import { KanbanCard } from './kanban-card';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  currentUserId?: string;
  currentUserRole?: WorkspaceRole;
  onTaskClick: (task: Task) => void;
  onQuickCreateTask?: (status: TaskStatus) => void;
}

const columnHeaderColors: Record<TaskStatus, { bg: string; dot: string }> = {
  TODO: { bg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300', dot: 'bg-slate-500' },
  IN_PROGRESS: { bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  IN_REVIEW: { bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  DONE: { bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
};

export function KanbanColumn({
  id,
  title,
  tasks,
  currentUserId,
  currentUserRole,
  onTaskClick,
  onQuickCreateTask,
}: KanbanColumnProps) {
  const headerStyle = columnHeaderColors[id] || columnHeaderColors.TODO;

  return (
    <div className="flex flex-col w-full min-w-67.5 max-w-xs rounded-xl bg-muted/40 p-3 border border-border/50">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${headerStyle.dot}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{title}</h3>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${headerStyle.bg}`}>
            {tasks.length}
          </span>
        </div>

        {onQuickCreateTask && (
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={() => onQuickCreateTask(id)}
          >
            <PlusIcon className="size-4" />
          </Button>
        )}
      </div>

      {/* Task List (Droppable Zone) */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-87.5 transition-colors rounded-lg p-1 ${
              snapshot.isDraggingOver ? 'bg-primary/5 ring-1 ring-primary/20' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <KanbanCard
                key={task.id}
                task={task}
                index={index}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                onClick={() => onTaskClick(task)}
              />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center h-28 border border-dashed border-border/60 rounded-lg text-center p-3">
                <p className="text-[11px] text-muted-foreground">Chưa có công việc nào</p>
                {onQuickCreateTask && (
                  <Button
                    variant="ghost"
                    size="xs"
                    className="mt-1 text-[11px] text-primary hover:underline cursor-pointer"
                    onClick={() => onQuickCreateTask(id)}
                  >
                    + Thêm nhanh
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
