'use client';

import * as React from 'react';
import { CheckSquareIcon, PlusIcon, Trash2Icon, CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ChecklistItem } from '../../types/task.types';

interface TaskChecklistProps {
  items?: ChecklistItem[];
  canEdit?: boolean;
  onUpdateChecklist?: (items: ChecklistItem[]) => Promise<void>;
}

export function TaskChecklist({ items = [], canEdit = true, onUpdateChecklist }: TaskChecklistProps) {
  const [newItemTitle, setNewItemTitle] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);

  const completedCount = items.filter((i) => i.isCompleted).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const handleToggle = async (itemId: string, checked: boolean) => {
    if (!onUpdateChecklist) return;
    const updated = items.map((item) =>
      item.id === itemId ? { ...item, isCompleted: checked } : item
    );
    await onUpdateChecklist(updated);
  };

  const handleAddItem = async () => {
    if (!newItemTitle.trim() || !onUpdateChecklist) return;
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      title: newItemTitle.trim(),
      isCompleted: false,
    };
    const updated = [...items, newItem];
    setNewItemTitle('');
    setIsAdding(false);
    await onUpdateChecklist(updated);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!onUpdateChecklist) return;
    const updated = items.filter((i) => i.id !== itemId);
    await onUpdateChecklist(updated);
  };

  return (
    <div className="space-y-3">
      {/* Header & Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquareIcon className="size-4 text-muted-foreground" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Danh sách công việc phụ ({completedCount}/{items.length})
            </span>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{progressPercent}%</span>
        </div>

        {items.length > 0 && (
          <Progress value={progressPercent} className="h-1.5 bg-muted/60" />
        )}
      </div>

      {/* Checklist items */}
      {items.length > 0 && (
        <div className="space-y-1.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Checkbox
                  checked={item.isCompleted}
                  onCheckedChange={(checked) => handleToggle(item.id, Boolean(checked))}
                  disabled={!canEdit}
                  className="size-4 rounded-md cursor-pointer"
                />
                <span
                  className={`text-xs font-medium text-foreground transition-all ${
                    item.isCompleted ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {item.title}
                </span>
              </div>

              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => handleDeleteItem(item.id)}
                  title="Xóa mục này"
                >
                  <Trash2Icon className="size-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Item form */}
      {canEdit && (
        <div>
          {isAdding ? (
            <div className="flex items-center gap-2 pt-1">
              <Input
                placeholder="Nhập tên việc cần làm..."
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                className="h-8 text-xs flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddItem();
                  if (e.key === 'Escape') setIsAdding(false);
                }}
              />
              <Button size="xs" onClick={handleAddItem} disabled={!newItemTitle.trim()} className="h-8 px-3 gap-1">
                <CheckIcon className="size-3.5" /> Thêm
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  setNewItemTitle('');
                  setIsAdding(false);
                }}
                className="h-8 px-3"
              >
                Hủy
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="xs"
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer shadow-xs border-dashed"
              onClick={() => setIsAdding(true)}
            >
              <PlusIcon className="size-3.5" /> Thêm mục mới
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
