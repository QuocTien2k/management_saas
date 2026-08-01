'use client';

import * as React from 'react';
import { Trash2Icon, Loader2Icon, Edit3Icon, CheckIcon, XIcon } from 'lucide-react';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommentSection } from '@/features/comment/components/comment-section';

import { MemberOption, TaskPriority, TaskStatus } from '../../types/task.types';
import { useUpdateTask, useDeleteTask, useTaskDetail } from '../../hooks/use-tasks';
import { useWorkspaceMembers } from '@/features/workspace/hooks/use-members';
import { useAuthStore } from '@/features/auth/store/auth-store';

interface TaskDetailModalProps {
  taskId: string | null;
  projectId: string;
  workspaceId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members?: MemberOption[];
}

const statusMap: Record<TaskStatus, string> = {
  TODO: 'Cần làm',
  IN_PROGRESS: 'Đang làm',
  IN_REVIEW: 'Đang duyệt',
  DONE: 'Hoàn thành',
};

const priorityMap: Record<TaskPriority, string> = {
  URGENT: 'Khẩn cấp',
  HIGH: 'Cao',
  MEDIUM: 'Trung bình',
  LOW: 'Thấp',
};

export function TaskDetailModal({
  taskId,
  projectId,
  workspaceId,
  open,
  onOpenChange,
  members,
}: TaskDetailModalProps) {
  const { user } = useAuthStore();
  const { data: task, isLoading } = useTaskDetail(open ? taskId : null);
  const { data: workspaceMembers } = useWorkspaceMembers(workspaceId || null);
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [isEditingDesc, setIsEditingDesc] = React.useState(false);

  const currentMember = React.useMemo(() => {
    if (!workspaceMembers || !user?.id) return null;
    return workspaceMembers.find((m) => m.userId === user.id || m.user.id === user.id);
  }, [workspaceMembers, user?.id]);

  const isOwnerOrAdmin = currentMember?.role === 'OWNER' || currentMember?.role === 'ADMIN';
  const isReporter = Boolean(task?.reporterId && user?.id && task.reporterId === user.id);
  const canDelete = isOwnerOrAdmin || isReporter;

  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task]);

  if (!open || !taskId) return null;

  const selectedMember = members?.find((m) => m.id === task?.assigneeId);

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
      <DialogContent className="sm:max-w-[660px] max-h-[88vh] overflow-y-auto p-6 gap-6 rounded-2xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground space-y-3">
            <Loader2Icon className="size-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Đang tải thông tin công việc...</p>
          </div>
        ) : task ? (
          <div className="space-y-6">
            {/* Header: Trạng thái & Nút xóa */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4 pr-8">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trạng thái:</span>
                <Select value={task.status} onValueChange={(v) => handleStatusChange(v as TaskStatus)}>
                  <SelectTrigger className="h-8 text-xs font-bold w-[150px] bg-background">
                    <SelectValue>
                      {statusMap[task.status] || 'Cần làm'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">Cần làm</SelectItem>
                    <SelectItem value="IN_PROGRESS">Đang làm</SelectItem>
                    <SelectItem value="IN_REVIEW">Đang duyệt</SelectItem>
                    <SelectItem value="DONE">Hoàn thành</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive cursor-pointer rounded-lg hover:bg-destructive/10 mr-2"
                  onClick={handleDelete}
                  title="Xóa công việc"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              )}
            </div>

            {/* Tiêu đề Task (Inline Edit) */}
            <div className="space-y-1">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg font-bold h-10 px-3"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSave();
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                  />
                  <Button size="sm" onClick={handleTitleSave} className="h-10 px-4">
                    Lưu
                  </Button>
                </div>
              ) : (
                <h2
                  className="text-xl font-bold text-foreground hover:bg-muted/40 p-2 -ml-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between group"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <span>{task.title}</span>
                  <Edit3Icon className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                </h2>
              )}
            </div>

            {/* Attributes Grid (Priority, Assignee, Due Date) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-muted/30 border border-border/60">
              {/* Priority */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">Độ ưu tiên</span>
                <Select value={task.priority} onValueChange={(v) => handlePriorityChange(v as TaskPriority)}>
                  <SelectTrigger className="h-8 text-xs font-medium bg-background w-full">
                    <SelectValue>
                      {priorityMap[task.priority] || 'Trung bình'}
                    </SelectValue>
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
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">Người thực hiện</span>
                <Select
                  value={task.assigneeId || 'UNASSIGNED'}
                  onValueChange={(v) => handleAssigneeChange(v as string)}
                >
                  <SelectTrigger className="h-8 text-xs font-medium bg-background w-full">
                    <SelectValue placeholder="Chưa giao">
                      {selectedMember ? (
                        <div className="flex items-center gap-1.5 truncate">
                          <Avatar className="size-4 shrink-0">
                            <AvatarImage src={selectedMember.avatar || undefined} />
                            <AvatarFallback className="text-[8px]">
                              {selectedMember.fullname?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate text-xs font-medium">{selectedMember.fullname}</span>
                        </div>
                      ) : (
                        'Chưa giao'
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNASSIGNED">Chưa giao</SelectItem>
                    {members?.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        <div className="flex items-center gap-2 max-w-full overflow-hidden py-0.5">
                          <Avatar className="size-4 shrink-0 border border-border/60">
                            <AvatarImage src={m.avatar || undefined} />
                            <AvatarFallback className="text-[8px]">
                              {m.fullname?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate text-xs">{m.fullname} ({m.email})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">Hạn hoàn thành</span>
                <Input
                  type="date"
                  value={formattedDueDateInput}
                  onChange={handleDueDateChange}
                  className="h-8 text-xs font-medium bg-background"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mô tả công việc</span>
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
                <div className="space-y-2.5">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="text-sm p-3 bg-background"
                  />
                  <div className="flex items-center gap-2">
                    <Button size="xs" onClick={handleDescSave} disabled={updateTask.isPending} className="gap-1">
                      <CheckIcon className="size-3.5" /> Lưu mô tả
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        setDescription(task.description || '');
                        setIsEditingDesc(false);
                      }}
                      className="gap-1"
                    >
                      <XIcon className="size-3.5" /> Hủy
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="p-3.5 rounded-xl bg-muted/20 border border-border/50 text-sm leading-relaxed min-h-16 cursor-pointer hover:border-border transition-colors whitespace-pre-wrap text-foreground/90"
                  onClick={() => setIsEditingDesc(true)}
                >
                  {task.description || (
                    <span className="text-muted-foreground italic text-xs">Chưa có mô tả chi tiết. Bấm vào đây để thêm...</span>
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
