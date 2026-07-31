'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckSquareIcon, Loader2Icon, CalendarIcon } from 'lucide-react';

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
import { TaskPriority, TaskStatus } from '../../types/task.types';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Tiêu đề công việc không được để trống'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

interface MemberOption {
  id: string;
  fullname: string;
  avatar?: string | null;
}

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  defaultStatus?: TaskStatus;
  members?: MemberOption[];
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  projectId,
  defaultStatus = 'TODO',
  members,
}: CreateTaskDialogProps) {
  const createTask = useCreateTask(projectId);

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
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        title: '',
        description: '',
        status: defaultStatus,
        priority: 'MEDIUM',
      });
    }
  }, [open, defaultStatus, reset]);

  const currentStatus = watch('status');
  const currentPriority = watch('priority');
  const currentAssignee = watch('assigneeId');

  const onSubmit = async (data: CreateTaskFormValues) => {
    try {
      await createTask.mutateAsync({
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        assigneeId: data.assigneeId === 'UNASSIGNED' ? undefined : data.assigneeId,
      });
      reset();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CheckSquareIcon className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Tạo công việc mới</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Thêm task mới vào dự án để theo dõi và phân công thực hiện.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-medium">
              Tiêu đề công việc <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="VD: Thiết kế giao diện Dashboard"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-[11px] text-destructive font-medium">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Cột trạng thái</Label>
              <Select value={currentStatus} onValueChange={(val) => setValue('status', val as TaskStatus)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">Cần làm</SelectItem>
                  <SelectItem value="IN_PROGRESS">Đang thực hiện</SelectItem>
                  <SelectItem value="IN_REVIEW">Đang duyệt</SelectItem>
                  <SelectItem value="DONE">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Độ ưu tiên</Label>
              <Select value={currentPriority} onValueChange={(val) => setValue('priority', val as TaskPriority)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Chọn ưu tiên" />
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Người thực hiện</Label>
              <Select
                value={currentAssignee || 'UNASSIGNED'}
                onValueChange={(val) => setValue('assigneeId', val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Chọn người làm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNASSIGNED">Chưa giao cho ai</SelectItem>
                  {members?.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-4">
                          <AvatarImage src={m.avatar || undefined} />
                          <AvatarFallback className="text-[8px]">{m.fullname?.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span>{m.fullname}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dueDate" className="text-xs font-medium">
                Hạn hoàn thành
              </Label>
              <Input
                id="dueDate"
                type="date"
                className="h-9 text-xs"
                {...register('dueDate')}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-medium">
              Mô tả chi tiết
            </Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Nhập ghi chú hoặc hướng dẫn công việc..."
              {...register('description')}
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createTask.isPending}
              className="gap-2"
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
