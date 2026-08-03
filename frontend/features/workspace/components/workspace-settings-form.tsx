'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { SaveIcon, Loader2Icon, AlertTriangleIcon, Trash2Icon } from 'lucide-react';

import { Workspace, WorkspaceRole } from '../types/workspace';
import {
  updateWorkspaceSchema,
  UpdateWorkspaceFormValues,
} from '../schemas/workspace-schema';
import { useUpdateWorkspace, useDeleteWorkspace } from '../hooks/use-workspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { WorkspaceAvatar } from '@/features/workspace/components/workspace-avatar';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/error';

interface WorkspaceSettingsFormProps {
  workspace: Workspace;
  currentUserRole?: WorkspaceRole;
}

export function WorkspaceSettingsForm({
  workspace,
  currentUserRole = 'MEMBER',
}: WorkspaceSettingsFormProps) {
  const router = useRouter();
  const updateMutation = useUpdateWorkspace();
  const deleteMutation = useDeleteWorkspace();

  const isOwner = currentUserRole === 'OWNER';
  const isAdmin = currentUserRole === 'ADMIN' || isOwner;

  const [savedSuccess, setSavedSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdateWorkspaceFormValues>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      name: workspace.name,
      description: workspace.description || '',
      logo: workspace.logo || workspace.logoUrl || '',
    },
  });

  const logoValue = watch('logo');
  const nameValue = watch('name') || workspace.name;

  const onSubmit = async (values: UpdateWorkspaceFormValues) => {
    try {
      setSavedSuccess(false);
      await updateMutation.mutateAsync({ id: workspace.id, data: values });
      setSavedSuccess(true);
      toast.success('Đã lưu thay đổi thông tin Workspace!');
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể cập nhật Workspace.'));
      console.error('Failed to update workspace settings:', error);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (
      confirm(
        `CẢNH BÁO: Bạn có chắc chắn muốn xóa hẳn Workspace "${workspace.name}" không? Thao tác này không thể hoàn tác.`
      )
    ) {
      try {
        await deleteMutation.mutateAsync(workspace.id);
        toast.success('Đã xóa Workspace thành công.');
        router.push('/workspaces');
      } catch (error) {
        toast.error(getErrorMessage(error, 'Không thể xóa Workspace.'));
        console.error('Failed to delete workspace:', error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-xs border-border/80">
        <CardHeader className="pb-4 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Thông tin chung</CardTitle>
          <CardDescription className="text-xs">
            Cập nhật tên, mô tả và hình ảnh nhận diện đại diện của Workspace.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-6 pb-6">
            {savedSuccess && (
              <div className="rounded-lg bg-emerald-500/15 p-3.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                Đã lưu thay đổi thông tin Workspace thành công!
              </div>
            )}

            {/* Tên Workspace */}
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-semibold">
                Tên Workspace <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                disabled={!isAdmin}
                placeholder="Nhập tên không gian làm việc..."
                className="h-10"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Mô tả Workspace */}
            <div className="space-y-2">
              <Label htmlFor="edit-desc" className="text-sm font-semibold">
                Mô tả Workspace
              </Label>
              <Textarea
                id="edit-desc"
                disabled={!isAdmin}
                rows={3}
                placeholder="Nhập mô tả về mục tiêu hoặc lĩnh vực của Workspace..."
                className="resize-none leading-relaxed"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs font-medium text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Logo URL & Live Preview */}
            <div className="space-y-2">
              <Label htmlFor="edit-logo" className="text-sm font-semibold">
                Logo Workspace
              </Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center justify-center p-2 border border-border/80 rounded-xl bg-muted/30">
                  <WorkspaceAvatar
                    name={nameValue}
                    logo={logoValue}
                    logoUrl={logoValue}
                    size="lg"
                  />
                </div>
                <div className="flex-1 w-full space-y-1">
                  <Input
                    id="edit-logo"
                    disabled={!isAdmin}
                    placeholder="https://example.com/logo.png"
                    className="h-10"
                    {...register('logo')}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Dán đường dẫn ảnh URL (PNG, JPG, SVG) để hiển thị làm logo nhóm.
                  </p>
                </div>
              </div>
              {errors.logo && (
                <p className="text-xs font-medium text-destructive">{errors.logo.message}</p>
              )}
            </div>
          </CardContent>

          {isAdmin && (
            <CardFooter className="flex justify-end border-t border-border/60 bg-muted/10 px-6 py-4">
              <Button type="submit" disabled={updateMutation.isPending} className="px-5 shadow-xs cursor-pointer">
                {updateMutation.isPending ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin mr-2" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <SaveIcon className="size-4 mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </form>
      </Card>

      {isOwner && (
        <Card className="border-destructive/30 bg-destructive/5 dark:bg-destructive/10">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive font-semibold">
              <AlertTriangleIcon className="size-5" />
              <span>Vùng nguy hiểm (Danger Zone)</span>
            </div>
            <CardDescription className="text-destructive/80">
              Xóa không gian làm việc này sẽ đánh dấu xóa toàn bộ dữ liệu dự án và nhiệm vụ liên quan.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-end pt-2">
            <Button
              variant="destructive"
              onClick={handleDeleteWorkspace}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2Icon className="size-4 animate-spin mr-1.5" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2Icon className="size-4 mr-1.5" />
                  Xóa Workspace này
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
