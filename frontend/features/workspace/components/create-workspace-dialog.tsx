'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { PlusIcon, Loader2Icon, Building2Icon } from 'lucide-react';

import {
  createWorkspaceSchema,
  CreateWorkspaceFormValues,
} from '../schemas/workspace-schema';
import { useCreateWorkspace } from '../hooks/use-workspace';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateWorkspaceDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function CreateWorkspaceDialog({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: CreateWorkspaceDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const router = useRouter();
  const createMutation = useCreateWorkspace();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkspaceFormValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      description: '',
      logoUrl: '',
    },
  });

  const onSubmit = async (values: CreateWorkspaceFormValues) => {
    try {
      const workspace = await createMutation.mutateAsync(values);
      reset();
      setOpen(false);
      router.push(`/workspaces/${workspace.id}`);
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger as React.ReactElement} />}
      <DialogContent className="sm:max-w-110">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-primary">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <Building2Icon className="size-5 text-primary" />
            </div>
            <DialogTitle>Tạo Workspace mới</DialogTitle>
          </div>
          <DialogDescription>
            Tạo không gian làm việc mới để quản lý dự án, công việc và cộng tác cùng nhóm của bạn.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="ws-name">Tên Workspace <span className="text-destructive">*</span></Label>
            <Input
              id="ws-name"
              placeholder="VD: Công ty công nghệ ABC"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ws-desc">Mô tả (Không bắt buộc)</Label>
            <Input
              id="ws-desc"
              placeholder="Mô tả ngắn gọn về nhóm hoặc dự án..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ws-logo">Logo URL (Không bắt buộc)</Label>
            <Input
              id="ws-logo"
              placeholder="https://example.com/logo.png"
              {...register('logoUrl')}
            />
            {errors.logoUrl && (
              <p className="text-xs text-destructive">{errors.logoUrl.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createMutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2Icon className="size-4 animate-spin mr-1.5" />
                  Đang tạo...
                </>
              ) : (
                'Tạo Workspace'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
