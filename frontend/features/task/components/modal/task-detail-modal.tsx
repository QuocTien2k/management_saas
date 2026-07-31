'use client';

import * as React from 'react';
import {
  Trash2Icon,
  XIcon,
  CalendarIcon,
  UserIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  Edit3Icon,
} from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CommentSection } from '@/features/comment/components/comment-section';

import { Task, TaskPriority, TaskStatus } from '../../types/task.types';
import { useUpdateTask, useDeleteTask, useTaskDetail } from '../../hooks/use-tasks';

interface MemberOption {
  id: string;
  fullname: string;
  avatar?: string | null;
}

interface TaskDetailModalProps {
  taskId: string | null;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members?: MemberOption[];
}

export function TaskDetailModal({
  taskId,
  projectId,
  open,
  onOpenChange,
  members,
}: TaskDetailModalProps) {
  const { data: task, isLoading } = useTaskDetail(open ? taskId : null);
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [isEditingDesc, setIsEditingDesc] = React.useState(false);

  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task]);

  if (!open || !taskId) return null;

  const handleTitleSave = async () => {
    if (!title.trim() || title === task?.title) {
      setIsEditingTitle(false);
      return;
    }
    try {
      await updateTask.mutateAsync({
        taskId,
        data: { title: title.trim() },
      });
      setIsEditingTitle(false);
    } catch (err) {
      console.error('Failed to update title:', err);
    }
  };

  const handleDescSave = async () => {
    try {
      await updateTask.mutateAsync({
        taskId,
        data: { description: description.trim() },
      });
      setIsEditingDesc(false);
    } catch (err) {
      console.error('Failed to update description:', err);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      await updateTask.mutateAsync({
        taskId,
        data: { status: newStatus },
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    try {
      await updateTask.mutateAsync({
        taskId,
        data: { priority: newPriority },
      });
    } catch (err) {
      console.error('Failed to update priority:', err);
    }
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    try {
      await updateTask.mutateAsync({
        taskId,
        data: { assigneeId: assigneeId === 'UNASSIGNED' ? null : assigneeId },
      });
    } catch (err) {
      console.error('Failed to update assignee:', err);
    }
  };

  const handleDueDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    try {
      await updateTask.mutateAsync({
        taskId,
        data: { dueDate: val ? new Date(val).toISOString() : null },
      });
    } catch (err) {
      console.error('Failed to update due date:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      try {
        await deleteTask.mutateAsync(taskId);
        onOpenChange(false);
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const formattedDueDateInput = task?.dueDate
    ? new Date(task.dueDate).toISOString().slice(0, 10)
    : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-162.5 max-h-[85vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2Icon className="size-6 animate-spin text-primary mr-2" /> Đang tải thông tin task...
          </div>
        ) : task ? (
          <div className="space-y-5">
            {/* Modal Header Actions */}
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <Select value={task.status} onValueChange={(v) => handleStatusChange(v as TaskStatus)}>
                  <SelectTrigger className="h-8 text-xs font-semibold w-35">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">Cần làm</SelectItem>
                    <SelectItem value="IN_PROGRESS">Đang làm</SelectItem>
                    <SelectItem value="IN_REVIEW">Đang duyệt</SelectItem>
                    <SelectItem value="DONE">Hoàn thành</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive cursor-pointer"
                  onClick={handleDelete}
                  title="Xóa công việc"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            </div>

            {/* Title (Inline Edit) */}
            <div className="space-y-1">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-base font-bold h-9"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSave();
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                  />
                  <Button size="xs" onClick={handleTitleSave}>
                    Lưu
                  </Button>
                </div>
              ) : (
                <h2
                  className="text-lg font-bold text-foreground hover:bg-muted/50 p-1.5 -ml-1.5 rounded-md cursor-pointer transition-colors flex items-center justify-between group"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <span>{task.title}</span>
                  <Edit3Icon className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </h2>
              )}
            </div>

            {/* Attributes Grid (Priority, Assignee, Due Date) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 text-xs">
              {/* Priority */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Độ ưu tiên</span>
                <Select value={task.priority} onValueChange={(v) => handlePriorityChange(v as TaskPriority)}>
                  <SelectTrigger className="h-7 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URGENT">Khẩn cấp</SelectItem>
                    <SelectItem value="HIGH">Cao</SelectItem>
                    <SelectItem value="MEDIUM">Trung bình</SelectItem>
                    <SelectItem value="LOW">Thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assignee */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Người thực hiện</span>
                <Select
                  value={task.assigneeId || 'UNASSIGNED'}
                  onValueChange={(v) => handleAssigneeChange(v as string)}
                >
                  <SelectTrigger className="h-7 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNASSIGNED">Chưa giao</SelectItem>
                    {members?.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        <div className="flex items-center gap-1.5">
                          <Avatar className="size-3.5">
                            <AvatarImage src={m.avatar || undefined} />
                            <AvatarFallback className="text-[7px]">{m.fullname?.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span>{m.fullname}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Ngày hết hạn</span>
                <Input
                  type="date"
                  value={formattedDueDateInput}
                  onChange={handleDueDateChange}
                  className="h-7 text-xs bg-background"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mô tả công việc</span>
                {!isEditingDesc && (
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-xs text-primary hover:underline cursor-pointer"
                    onClick={() => setIsEditingDesc(true)}
                  >
                    Chỉnh sửa
                  </Button>
                )}
              </div>

              {isEditingDesc ? (
                <div className="space-y-2">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <Button size="xs" onClick={handleDescSave} disabled={updateTask.isPending}>
                      Lưu mô tả
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        setDescription(task.description || '');
                        setIsEditingDesc(false);
                      }}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="p-3 rounded-lg bg-muted/20 border border-border/40 text-xs leading-relaxed min-h-15 cursor-pointer hover:border-border transition-colors whitespace-pre-wrap"
                  onClick={() => setIsEditingDesc(true)}
                >
                  {task.description || (
                    <span className="text-muted-foreground italic">Chưa có mô tả. Bấm vào đây để thêm...</span>
                  )}
                </div>
              )}
            </div>

            {/* Comment Section */}
            <CommentSection taskId={task.id} />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
