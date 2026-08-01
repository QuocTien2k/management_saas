'use client';

import * as React from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Task, TaskStatus } from '../../types/task.types';
import { KanbanColumn } from './kanban-column';
import { useMoveTask } from '../../hooks/use-tasks';

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onQuickCreateTask?: (status: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'TODO', title: 'Cần làm' },
  { id: 'IN_PROGRESS', title: 'Đang thực hiện' },
  { id: 'IN_REVIEW', title: 'Đang duyệt' },
  { id: 'DONE', title: 'Hoàn thành' },
];

export function KanbanBoard({
  projectId,
  tasks,
  onTaskClick,
  onQuickCreateTask,
}: KanbanBoardProps) {
  const [enabled, setEnabled] = React.useState(false);
  const moveTask = useMoveTask(projectId);

  // Tránh hydration mismatch trên Next.js App Router
  React.useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // Không thay đổi nếu thả lại cùng vị trí
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    const newPosition = (destination.index + 1) * 1000;

    moveTask.mutate({
      taskId: draggableId,
      data: {
        columnId: newStatus,
        position: newPosition,
      },
    });
  };

  if (!enabled) return null;

  // Phân nhóm tasks theo cột
  const tasksByColumn: Record<TaskStatus, Task[]> = {
    TODO: [],
    IN_PROGRESS: [],
    IN_REVIEW: [],
    DONE: [],
  };

  tasks.forEach((t) => {
    if (tasksByColumn[t.status]) {
      tasksByColumn[t.status].push(t);
    } else {
      tasksByColumn.TODO.push(t);
    }
  });

  // Sắp xếp task theo position trong từng cột
  Object.keys(tasksByColumn).forEach((colKey) => {
    const statusKey = colKey as TaskStatus;
    tasksByColumn[statusKey].sort((a, b) => a.position - b.position);
  });

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 items-start scrollbar-thin">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={tasksByColumn[col.id] || []}
            onTaskClick={onTaskClick}
            onQuickCreateTask={onQuickCreateTask}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
