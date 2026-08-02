'use client';

import * as React from 'react';
import { TagIcon, PlusIcon, XIcon, CheckIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { TaskLabel } from '../../types/task.types';

interface TaskLabelsProps {
  labels?: TaskLabel[];
  canEdit?: boolean;
  onUpdateLabels?: (labels: TaskLabel[]) => Promise<void>;
}

const PREDEFINED_COLORS = [
  { name: 'Xanh dương', hex: '#3b82f6', bg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' },
  { name: 'Xanh lá', hex: '#10b981', bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
  { name: 'Cam', hex: '#f59e0b', bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
  { name: 'Đỏ', hex: '#ef4444', bg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' },
  { name: 'Tím', hex: '#8b5cf6', bg: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30' },
  { name: 'Hồng', hex: '#ec4899', bg: 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30' },
  { name: 'Xám', hex: '#64748b', bg: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30' },
];

export function TaskLabels({ labels = [], canEdit = true, onUpdateLabels }: TaskLabelsProps) {
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [newLabelName, setNewLabelName] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState(PREDEFINED_COLORS[0].hex);

  const handleAddLabel = async () => {
    if (!newLabelName.trim() || !onUpdateLabels) return;
    const newLabel: TaskLabel = {
      id: Date.now().toString(),
      name: newLabelName.trim(),
      color: selectedColor,
    };
    const updated = [...labels, newLabel];
    setNewLabelName('');
    setPopoverOpen(false);
    await onUpdateLabels(updated);
  };

  const handleRemoveLabel = async (labelId: string) => {
    if (!onUpdateLabels) return;
    const updated = labels.filter((l) => l.id !== labelId);
    await onUpdateLabels(updated);
  };

  const getLabelStyle = (colorHex: string) => {
    const matched = PREDEFINED_COLORS.find((c) => c.hex === colorHex);
    return matched ? matched.bg : 'bg-primary/10 text-primary border-primary/20';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <TagIcon className="size-4 text-muted-foreground" />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Nhãn dán ({labels.length})
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {labels.map((label) => (
          <Badge
            key={label.id}
            variant="outline"
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1 border ${getLabelStyle(
              label.color
            )}`}
          >
            <span>{label.name}</span>
            {canEdit && (
              <button
                type="button"
                onClick={() => handleRemoveLabel(label.id)}
                className="hover:opacity-75 focus:outline-hidden ml-0.5 cursor-pointer"
              >
                <XIcon className="size-3" />
              </button>
            )}
          </Badge>
        ))}

        {canEdit && (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  size="xs"
                  className="h-6 gap-1 text-[11px] font-medium border-dashed border-border/80 hover:border-primary cursor-pointer rounded-md px-2"
                >
                  <PlusIcon className="size-3" /> Thêm nhãn
                </Button>
              }
            />
            <PopoverContent className="w-64 p-3 space-y-3 rounded-xl" align="start">
              <h4 className="text-xs font-bold text-foreground">Thêm nhãn dán mới</h4>

              <div className="space-y-2">
                <Input
                  placeholder="Tên nhãn..."
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  className="h-8 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddLabel();
                  }}
                />

                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground">Chọn màu sắc</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {PREDEFINED_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setSelectedColor(c.hex)}
                        className={`size-6 rounded-full flex items-center justify-center transition-transform cursor-pointer border ${
                          selectedColor === c.hex ? 'scale-110 ring-2 ring-primary ring-offset-1' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {selectedColor === c.hex && <CheckIcon className="size-3 text-white stroke-3" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                size="xs"
                className="w-full text-xs font-medium cursor-pointer"
                disabled={!newLabelName.trim()}
                onClick={handleAddLabel}
              >
                Tạo nhãn
              </Button>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
