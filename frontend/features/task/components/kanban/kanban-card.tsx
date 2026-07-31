'use client';

import * as React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { CalendarIcon, MessageSquareIcon, AlertCircleIcon, ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Task, TaskPriority } from '../../types/task.types';

interface KanbanCardProps {
  task: Task;
  index: number;
  onClick?: () => void;
}

const priorityConfig: Record<TaskPriority, { label: string; bg: string; icon: React.ReactNode }> = {
  URGENT: {
    label: 'Khẩn cấp',
    bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    icon: <AlertCircleIcon className="size-3 text-red-500" />,
  },
  HIGH: {
    label: 'Cao',
    bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    icon: <ArrowUpIcon className="size-3 text-amber-500" />,
  },
  MEDIUM: {
    label: 'Trung bình',
    bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    icon: <MinusIcon className="size-3 text-blue-500" />,
  },
  LOW: {
    label: 'Thấp',
    bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
    icon: <ArrowDownIcon className="size-3 text-slate-500" />,
  },
};

export function KanbanCard({ task, index, onClick }: KanbanCardProps) {
  const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM;

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('vi-VN', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className="mb-2.5 outline-none select-none cursor-grab active:cursor-grabbing"
        >
          <Card
            className={`transition-all duration-150 border-border/70 hover:border-border hover:shadow-sm ${
              snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/40 rotate-1 scale-[1.02]' : ''
            }`}
          >
            <CardContent className="p-3 space-y-2.5">
              {/* Priority badge */}
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${priority.bg}`}>
                  {priority.icon}
                  {priority.label}
                </span>
              </div>

              {/* Title */}
              <h4 className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
                {task.title}
              </h4>

              {/* Footer info: Due date, comment count, Assignee */}
              <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2.5">
                  {formattedDueDate && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <CalendarIcon className="size-3 text-muted-foreground" />
                      <span>{formattedDueDate}</span>
                    </div>
                  )}

                  {Boolean(task._count?.comments) && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageSquareIcon className="size-3" />
                      <span>{task._count?.comments}</span>
                    </div>
                  )}
                </div>

                <Avatar className="size-5 border border-border/60">
                  <AvatarImage src={task.assignee?.avatar || undefined} alt={task.assignee?.fullname} />
                  <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
                    {task.assignee?.fullname?.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
