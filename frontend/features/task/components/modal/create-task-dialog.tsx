'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckSquareIcon, Loader2Icon, UserIcon } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCreateTask } from '../../hooks/use-tasks';
import { AttachmentList } from '../attachment/attachment-list';
import { MemberOption, TaskPriority, TaskStatus, TaskAttachment } from '../../types/task.types';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Tiêu đề công việc không được để trống'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  defaultStatus?: TaskStatus;
  members?: MemberOption[];
}

const statusMap: Record<TaskStatus, string> = {
  TODO: 'Cần làm',
  IN_PROGRESS: 'Đang thực hiện',
  IN_REVIEW: 'Đang duyệt',
  DONE: 'Hoàn thành',
};

const priorityMap: Record<TaskPriority, string> = {
  URGENT: 'Khẩn cấp',
  HIGH: 'Cao',
  MEDIUM: 'Trung bình',
  LOW: 'Thấp',
};

export function CreateTaskDialog({
  open,
  onOpenChange,
  projectId,
  defaultStatus = 'TODO',
  members,
}: CreateTaskDialogProps) {
  const createTask = useCreateTask(projectId);
  const [attachments, setAttachments] = React.useState<TaskAttachment[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: defaultStatus,
      priority: 'MEDIUM',
      assigneeId: 'UNASSIGNED',
    },
  });

  React.useEffect(() => {
    if (open) {
      setAttachments([]);
      reset({
        title: '',
        description: '',
        status: defaultStatus,
        priority: 'MEDIUM',
        assigneeId: 'UNASSIGNED',
      });
    }
  }, [open, defaultStatus, reset]);

  const currentStatus = watch('status');
  const currentPriority = watch('priority');
  const currentAssignee = watch('assigneeId');

  const selectedMember = React.useMemo(() => {
    if (!currentAssignee || currentAssignee === 'UNASSIGNED') return null;
    return members?.find((m) => m.id === currentAssignee) || null;
  }, [currentAssignee, members]);

  const onSubmit = async (data: CreateTaskFormValues) => {
    try {
      await createTask.mutateAsync({
        title: data.title,
        description: data.description,
        status: 'TODO',
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        assigneeId: data.assigneeId === 'UNASSIGNED' ? undefined : data.assigneeId,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      setAttachments([]);
      reset();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-140 p-6 gap-6 rounded-2xl">
        <DialogHeader className="p-0 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <CheckSquareIcon className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">Tạo công việc mới</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Điền đầy đủ thông tin để thêm công việc mới vào bảng dự án.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tiêu đề công việc */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-foreground">
              Tiêu đề công việc <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="VD: Thiết kế giao diện Dashboard SaaS..."
              className="h-10 text-sm px-3 bg-background"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-destructive font-medium">{errors.title.message}</p>
            )}
          </div>

          {/* Cột trạng thái & Độ ưu tiên */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Trạng thái (Mặc định)</Label>
              <Select disabled value="TODO">
                <SelectTrigger className="h-10 text-sm bg-muted/50 w-full cursor-not-allowed">
                  <SelectValue placeholder="Cần làm">
                    Cần làm (TODO)
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">Cần làm (TODO)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Độ ưu tiên</Label>
              <Select value={currentPriority} onValueChange={(val) => setValue('priority', val as TaskPriority)}>
                <SelectTrigger className="h-10 text-sm bg-background w-full">
                  <SelectValue placeholder="Chọn ưu tiên">
                    {priorityMap[currentPriority] || 'Trung bình'}
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
          </div>

          {/* Người thực hiện & Hạn hoàn thành */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Người thực hiện</Label>
              <Select
                value={currentAssignee || 'UNASSIGNED'}
                onValueChange={(val) => setValue('assigneeId', val)}
              >
                <SelectTrigger className="h-10 text-sm bg-background w-full">
                  <SelectValue placeholder="Chọn người làm">
                    {selectedMember ? (
                      <div className="flex items-center gap-2 truncate">
                        <Avatar className="size-4 shrink-0">
                          <AvatarImage src={selectedMember.avatar || undefined} />
                          <AvatarFallback className="text-[8px]">
                            {selectedMember.fullname?.slice(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate text-sm font-medium">
                          {selectedMember.fullname} ({selectedMember.email})
                        </span>
                      </div>
                    ) : (
                      'Chưa giao cho ai'
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNASSIGNED">Chưa giao cho ai</SelectItem>
                  {members?.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2.5 max-w-full overflow-hidden py-0.5">
                        <Avatar className="size-5 shrink-0 border border-border/60">
                          <AvatarImage src={m.avatar || undefined} />
                          <AvatarFallback className="text-[9px] font-bold">
                            {m.fullname?.slice(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col truncate text-left">
                          <span className="text-sm font-medium text-foreground truncate">{m.fullname}</span>
                          <span className="text-xs text-muted-foreground truncate">{m.email}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-sm font-semibold text-foreground">
                Hạn hoàn thành
              </Label>
              <Input
                id="dueDate"
                type="date"
                className="h-10 text-sm bg-background"
                {...register('dueDate')}
              />
            </div>
          </div>

          {/* Mô tả chi tiết */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-foreground">
              Mô tả chi tiết
            </Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Nhập yêu cầu chi tiết hoặc thông tin công việc..."
              className="text-sm p-3 resize-none bg-background"
              {...register('description')}
            />
          </div>

          {/* Tệp đính kèm */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <AttachmentList
              taskId=""
              attachments={attachments}
              canEdit={true}
              onUpload={async (files) => {
                const newAttachments = Array.from(files).map((f, idx) => ({
                  id: Date.now().toString() + idx,
                  filename: f.name,
                  fileName: f.name,
                  fileUrl: URL.createObjectURL(f),
                  publicUrl: URL.createObjectURL(f),
                  fileSize: f.size,
                  fileType: f.type || 'application/octet-stream',
                  mimeType: f.type || 'application/octet-stream',
                  uploadedAt: new Date().toISOString(),
                }));
                setAttachments((prev) => [...prev, ...newAttachments]);
              }}
              onDelete={async (attachmentId) => {
                setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
              }}
            />
          </div>

          <DialogFooter className="pt-4 border-t border-border/60 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="default"
              className="h-10 text-sm font-medium px-4 cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="default"
              disabled={createTask.isPending}
              className="h-10 text-sm font-semibold px-5 gap-2 shadow-xs cursor-pointer"
            >
              {createTask.isPending && <Loader2Icon className="size-4 animate-spin" />}
              Tạo Công việc
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
