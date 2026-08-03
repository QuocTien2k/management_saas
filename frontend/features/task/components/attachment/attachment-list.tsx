'use client';

import * as React from 'react';
import {
  PaperclipIcon,
  UploadCloudIcon,
  FileIcon,
  ImageIcon,
  FileTextIcon,
  Trash2Icon,
  DownloadIcon,
  Loader2Icon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskAttachment } from '../../types/task.types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface AttachmentListProps {
  taskId: string;
  attachments?: TaskAttachment[];
  canEdit?: boolean;
  onUpload?: (files: FileList) => Promise<void>;
  onDelete?: (attachmentId: string) => Promise<void>;
}

export function AttachmentList({
  taskId,
  attachments = [],
  canEdit = true,
  onUpload,
  onDelete,
}: AttachmentListProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="size-5 text-blue-500" />;
    if (fileType.includes('pdf') || fileType.includes('word') || fileType.includes('document'))
      return <FileTextIcon className="size-5 text-emerald-500" />;
    return <FileIcon className="size-5 text-muted-foreground" />;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onUpload) {
      try {
        setIsUploading(true);
        await onUpload(e.target.files);
      } catch (err) {
        console.error('File upload failed:', err);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (canEdit && e.dataTransfer.files && e.dataTransfer.files.length > 0 && onUpload) {
      try {
        setIsUploading(true);
        await onUpload(e.dataTransfer.files);
      } catch (err) {
        console.error('File drop upload failed:', err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (attachmentToDelete && onDelete) {
      try {
        setDeletingId(attachmentToDelete);
        await onDelete(attachmentToDelete);
      } catch (err) {
        console.error('Delete attachment failed:', err);
      } finally {
        setDeletingId(null);
        setAttachmentToDelete(null);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PaperclipIcon className="size-4 text-muted-foreground" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Tệp đính kèm ({attachments.length})
          </span>
        </div>

        {canEdit && (
          <Button
            variant="outline"
            size="xs"
            className="gap-1.5 text-xs cursor-pointer shadow-xs"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <UploadCloudIcon className="size-3.5" />
            )}
            Tải tệp lên
          </Button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        multiple
      />

      {/* Drag and Drop Zone */}
      {canEdit && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border/70 hover:border-primary/50 bg-muted/10'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-1">
            <UploadCloudIcon className="size-6 text-muted-foreground stroke-1.5" />
            <p className="text-xs text-muted-foreground">
              Kéo & thả tệp vào đây, hoặc <span className="text-primary font-medium">chọn tệp từ máy tính</span>
            </p>
            <p className="text-[10px] text-muted-foreground/70">Kích thước tối đa 10 MB mỗi tệp</p>
          </div>
        </div>
      )}

      {/* Attachments List */}
      {attachments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {attachments.map((file) => {
            const name = file.fileName || file.filename || 'Tệp đính kèm';
            const type = file.mimeType || file.fileType || 'application/octet-stream';
            const url = file.publicUrl || file.fileUrl || '#';

            return (
              <div
                key={file.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/70 hover:border-border transition-colors group shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="size-9 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                    {getFileIcon(type)}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-medium text-foreground truncate">{name}</span>
                    <span className="text-[10px] text-muted-foreground">{formatFileSize(file.fileSize)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Tải về"
                  >
                    <DownloadIcon className="size-4" />
                  </a>

                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    onClick={() => setAttachmentToDelete(file.id)}
                    disabled={deletingId === file.id}
                    title="Xóa tệp"
                  >
                    {deletingId === file.id ? (
                      <Loader2Icon className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2Icon className="size-3.5" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(attachmentToDelete)}
        onOpenChange={(open) => !open && setAttachmentToDelete(null)}
        title="Xóa tệp đính kèm"
        description="Bạn có chắc chắn muốn xóa tệp đính kèm này khỏi công việc?"
        confirmText="Xóa tệp"
        cancelText="Hủy bỏ"
        variant="destructive"
        isLoading={Boolean(deletingId)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
