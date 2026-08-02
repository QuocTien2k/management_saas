'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface TaskStatusChartProps {
  todoCount: number;
  inProgressCount: number;
  inReviewCount: number;
  doneCount: number;
}

export function TaskStatusChart({
  todoCount = 0,
  inProgressCount = 0,
  inReviewCount = 0,
  doneCount = 0,
}: TaskStatusChartProps) {
  const total = todoCount + inProgressCount + inReviewCount + doneCount;

  const data = [
    { label: 'Cần làm', count: todoCount, color: '#3b82f6', bg: 'bg-blue-500' },
    { label: 'Đang làm', count: inProgressCount, color: '#f59e0b', bg: 'bg-amber-500' },
    { label: 'Đang duyệt', count: inReviewCount, color: '#8b5cf6', bg: 'bg-purple-500' },
    { label: 'Hoàn thành', count: doneCount, color: '#10b981', bg: 'bg-emerald-500' },
  ];

  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Phân bổ Trạng thái Công việc</CardTitle>
        <CardDescription className="text-xs">Tỉ lệ công việc phân bổ theo từng giai đoạn.</CardDescription>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {total > 0 ? (
          <>
            {/* Visual Bar Distribution */}
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex shadow-inner">
              {data.map((item) => {
                const percent = (item.count / total) * 100;
                if (percent === 0) return null;
                return (
                  <div
                    key={item.label}
                    style={{ width: `${percent}%`, backgroundColor: item.color }}
                    className="h-full transition-all duration-500 hover:opacity-85"
                    title={`${item.label}: ${item.count} (${Math.round(percent)}%)`}
                  />
                );
              })}
            </div>

            {/* Legend Stats */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {data.map((item) => {
                const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2">
                      <span className={`size-2.5 rounded-full ${item.bg}`} />
                      <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground">{item.count}</span>
                      <span className="text-[10px] text-muted-foreground">({percent}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground italic">
            Chưa có công việc nào trong hệ thống.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
