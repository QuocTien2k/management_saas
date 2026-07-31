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
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

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
    formState: { errors },
  } = useForm<UpdateWorkspaceFormValues>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      name: workspace.name,
      description: workspace.description || '',
      logo: workspace.logo || workspace.logoUrl || '',
    },
  });

  const onSubmit = async (values: UpdateWorkspaceFormValues) => {
    try {
      setSavedSuccess(false);
      await updateMutation.mutateAsync({ id: workspace.id, data: values });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (error) {
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
        router.push('/workspaces');
      } catch (error) {
        console.error('Failed to delete workspace:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
          <CardDescription>Cập nhật tên, mô tả và nhận diện logo của Workspace.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {savedSuccess && (
              <div className="rounded-lg bg-emerald-500/15 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                Đã lưu thay đổi thành công!
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Tên Workspace</Label>
              <Input
                id="edit-name"
                disabled={!isAdmin}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-desc">Mô tả Workspace</Label>
              <Input
                id="edit-desc"
                disabled={!isAdmin}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-logo">Logo URL</Label>
              <Input
                id="edit-logo"
                disabled={!isAdmin}
                {...register('logo')}
              />
              {errors.logo && (
                <p className="text-xs text-destructive">{errors.logo.message}</p>
              )}
            </div>
          </CardContent>

          {isAdmin && (
            <CardFooter className="flex justify-end border-t pt-4">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin mr-1.5" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <SaveIcon className="size-4 mr-1.5" />
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
