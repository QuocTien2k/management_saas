'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlusIcon, Loader2Icon, MailIcon, ShieldIcon } from 'lucide-react';

import {
  inviteMemberSchema,
  InviteMemberFormValues,
} from '../schemas/workspace-schema';
import { useInviteMember } from '../hooks/use-members';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/error';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InviteMemberDialogProps {
  workspaceId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function InviteMemberDialog({
  workspaceId,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: InviteMemberDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const inviteMutation = useInviteMember(workspaceId);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'MEMBER',
    },
  });

  const onSubmit = async (values: InviteMemberFormValues) => {
    try {
      await inviteMutation.mutateAsync(values);
      toast.success(`Đã gửi lời mời thành công đến ${values.email}`);
      reset();
      setOpen(false);
    } catch (error: any) {
      console.error('Failed to invite member:', error);
      toast.error(getErrorMessage(error, 'Không thể gửi lời mời thành viên.'));
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger as React.ReactElement} />}
      <DialogContent className="sm:max-w-110">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-primary">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <UserPlusIcon className="size-5 text-primary" />
            </div>
            <DialogTitle>Mời thành viên mới</DialogTitle>
          </div>
          <DialogDescription>
            Nhập email của thành viên bạn muốn mời vào làm việc cùng nhóm.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Địa chỉ Email</Label>
              <div className="relative">
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="dongnghiep@company.com"
                  className="pl-9"
                  {...register('email')}
                />
                <MailIcon className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invite-role">Vai trò ban đầu</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={inviteMutation.isPending}
                  >
                    <SelectTrigger id="invite-role" className="w-full">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Member (Thành viên làm việc)</SelectItem>
                      <SelectItem value="ADMIN">Admin (Quản trị viên dự án)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-xs text-destructive">{errors.role.message}</p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={inviteMutation.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin mr-1.5" />
                    Đang gửi lời mời...
                  </>
                ) : (
                  'Gửi lời mời'
                )}
              </Button>
            </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>
  );
}
