'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { SettingsIcon, Trash2Icon, Loader2Icon, CheckIcon, ArchiveIcon, RefreshCwIcon } from 'lucide-react';

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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Project, ProjectStatus } from '../types/project.types';
import { useUpdateProject, useDeleteProject } from '../hooks/use-projects';

interface ProjectSettingsDialogProps {
  workspaceId: string;
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PREDEFINED_COLORS = [
  { hex: '#3b82f6', label: 'Xanh dương' },
  { hex: '#10b981', label: 'Xanh lá' },
  { hex: '#f59e0b', label: 'Cam' },
  { hex: '#ef4444', label: 'Đỏ' },
  { hex: '#8b5cf6', label: 'Tím' },
  { hex: '#ec4899', label: 'Hồng' },
];

export function ProjectSettingsDialog({
  workspaceId,
  project,
  open,
  onOpenChange,
}: ProjectSettingsDialogProps) {
  const router = useRouter();
  const updateProject = useUpdateProject(workspaceId);
  const deleteProject = useDeleteProject(workspaceId);

  const [name, setName] = React.useState(project.name);
  const [description, setDescription] = React.useState(project.description || '');
  const [color, setColor] = React.useState(project.color || PREDEFINED_COLORS[0].hex);
  const [isArchived, setIsArchived] = React.useState(project.status === 'ARCHIVED');

  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState('');

  React.useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setColor(project.color || PREDEFINED_COLORS[0].hex);
      setIsArchived(project.status === 'ARCHIVED');
    }
  }, [project]);

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      const updatedStatus: ProjectStatus = isArchived
        ? 'ARCHIVED'
        : project.status === 'ARCHIVED'
        ? 'IN_PROGRESS'
        : project.status;

      await updateProject.mutateAsync({
        id: project.id,
        data: {
          name: name.trim(),
          description: description.trim(),
          color,
          status: updatedStatus,
        },
      });
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to update project settings:', err);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== project.name) return;
    try {
      setIsDeleting(true);
      await deleteProject.mutateAsync(project.id);
      onOpenChange(false);
      router.push(`/workspaces/${workspaceId}/projects`);
    } catch (err) {
      console.error('Failed to delete project:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 rounded-2xl gap-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <SettingsIcon className="size-5 text-primary" />
            Cài đặt dự án
          </DialogTitle>
          <DialogDescription className="text-xs">
            Quản lý thông tin chi tiết, màu sắc đại diện và trạng thái lưu trữ của dự án.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Tên dự án */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Tên dự án *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Website E-Commerce"
              className="text-xs h-9"
            />
          </div>

          {/* Mô tả dự án */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Mô tả dự án</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả mục tiêu của dự án này..."
              rows={3}
              className="text-xs"
            />
          </div>

          {/* Màu đại diện */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Màu sắc chủ đề</Label>
            <div className="flex items-center gap-2">
              {PREDEFINED_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`size-7 rounded-full flex items-center justify-center border transition-transform cursor-pointer ${
                    color === c.hex ? 'scale-110 ring-2 ring-primary ring-offset-2' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                >
                  {color === c.hex && <CheckIcon className="size-4 text-white stroke-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* Trạng thái Archive */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
            <div className="flex items-center gap-2.5">
              <ArchiveIcon className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold">Trạng thái dự án</p>
                <p className="text-[11px] text-muted-foreground">
                  {isArchived ? 'Dự án đang bị lưu trữ (Archived)' : 'Dự án đang hoạt động'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="xs"
              type="button"
              onClick={() => setIsArchived(!isArchived)}
              className="text-xs gap-1.5 cursor-pointer"
            >
              <RefreshCwIcon className="size-3.5" />
              {isArchived ? 'Bật lại' : 'Lưu trữ'}
            </Button>
          </div>

          {/* Zone Xóa dự án */}
          <div className="border-t border-destructive/20 pt-3 mt-4 space-y-2">
            <h4 className="text-xs font-bold text-destructive flex items-center gap-1.5">
              <Trash2Icon className="size-3.5" /> Xóa vĩnh viễn dự án này
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Hành động này không thể hoàn tác. Nhập tên dự án <strong className="text-foreground">{project.name}</strong> bên dưới để xác nhận xóa.
            </p>
            <div className="flex items-center gap-2">
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={project.name}
                className="text-xs h-8 border-destructive/30 focus-visible:ring-destructive/30"
              />
              <Button
                variant="destructive"
                size="xs"
                disabled={deleteConfirmText !== project.name || isDeleting}
                onClick={handleDelete}
                className="h-8 px-3 cursor-pointer shrink-0"
              >
                {isDeleting ? <Loader2Icon className="size-3.5 animate-spin" /> : 'Xóa ngay'}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button size="sm" onClick={handleSave} disabled={updateProject.isPending || !name.trim()}>
            {updateProject.isPending ? <Loader2Icon className="size-4 animate-spin" /> : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
