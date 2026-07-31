'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FolderKanbanIcon, Loader2Icon } from 'lucide-react';

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
import { useCreateProject } from '../hooks/use-projects';

const createProjectSchema = z.object({
  name: z.string().min(2, 'Tên dự án phải từ 2 ký tự trở lên'),
  key: z
    .string()
    .min(2, 'Mã ngắn phải từ 2 ký tự trở lên')
    .max(10, 'Mã ngắn không quá 10 ký tự')
    .regex(/^[A-Z0-9]+$/i, 'Mã ngắn chỉ bao gồm chữ cái và số')
    .transform((v) => v.toUpperCase()),
  description: z.string().optional(),
});

type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  workspaceId,
}: CreateProjectDialogProps) {
  const createProject = useCreateProject(workspaceId);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      key: '',
      description: '',
    },
  });

  // Tự động gợi ý Key từ tên Dự án
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedKey = val
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 5);

    if (generatedKey && generatedKey.length >= 2) {
      setValue('key', generatedKey);
    }
  };

  const onSubmit = async (data: CreateProjectFormValues) => {
    try {
      await createProject.mutateAsync(data);
      reset();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Failed to create project:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FolderKanbanIcon className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Tạo Dự án mới</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Tạo một bảng dự án mới để quản lý công việc và phân công thành viên.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium">
              Tên dự án <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="VD: Xây dựng Website SaaS"
              {...register('name')}
              onChange={(e) => {
                register('name').onChange(e);
                handleNameChange(e);
              }}
            />
            {errors.name && (
              <p className="text-[11px] text-destructive font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="key" className="text-xs font-medium">
              Mã dự án (Key) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="key"
              placeholder="VD: SAAS"
              className="uppercase font-mono text-xs tracking-wider"
              {...register('key')}
            />
            <p className="text-[11px] text-muted-foreground">
              Mã dùng để định danh tiền tố mã công việc (ví dụ: SAAS-1, SAAS-2).
            </p>
            {errors.key && (
              <p className="text-[11px] text-destructive font-medium">{errors.key.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-medium">
              Mô tả ngắn
            </Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Mô tả mục tiêu chính hoặc phạm vi dự án..."
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
              disabled={createProject.isPending}
              className="gap-2"
            >
              {createProject.isPending && <Loader2Icon className="size-4 animate-spin" />}
              Tạo Dự án
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
