'use client';

import * as React from 'react';
import { AlertTriangleIcon, Trash2Icon, Loader2Icon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'warning' | 'default';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Xác nhận hành động',
  description = 'Bạn có chắc chắn muốn thực hiện hành động này? Thao tác này không thể hoàn tác.',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'destructive',
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          iconBg: 'bg-destructive/10 text-destructive dark:bg-destructive/20',
          icon: <Trash2Icon className="size-5 stroke-2" />,
          btnVariant: 'destructive' as const,
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 dark:bg-amber-500/25',
          icon: <AlertTriangleIcon className="size-5 stroke-2" />,
          btnVariant: 'default' as const,
        };
      default:
        return {
          iconBg: 'bg-primary/10 text-primary',
          icon: <AlertTriangleIcon className="size-5 stroke-2" />,
          btnVariant: 'default' as const,
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-6 gap-5">
        <div className="flex items-start gap-4">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${styles.iconBg}`}>
            {styles.icon}
          </div>

          <div className="space-y-1.5 pt-0.5">
            <DialogTitle className="text-base font-bold tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
              {description}
            </DialogDescription>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="cursor-pointer"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={styles.btnVariant}
            size="sm"
            onClick={handleConfirm}
            disabled={isLoading}
            className="cursor-pointer font-semibold px-4"
          >
            {isLoading ? (
              <>
                <Loader2Icon className="size-3.5 animate-spin mr-1.5" />
                Đang xử lý...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
