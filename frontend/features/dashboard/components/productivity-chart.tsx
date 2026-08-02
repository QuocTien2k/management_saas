'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Task } from '@/features/task/types/task.types';

interface ProductivityChartProps {
  tasks?: Task[];
}

export function ProductivityChart({ tasks = [] }: ProductivityChartProps) {
  const dayNames = [
    { label: 'Th 2', dayIndex: 1 },
    { label: 'Th 3', dayIndex: 2 },
    { label: 'Th 4', dayIndex: 3 },
    { label: 'Th 5', dayIndex: 4 },
    { label: 'Th 6', dayIndex: 5 },
    { label: 'Th 7', dayIndex: 6 },
    { label: 'CN', dayIndex: 0 },
  ];

  const completedTasks = tasks.filter((t) => t.status === 'DONE');

  const countsPerDay = dayNames.map(({ label, dayIndex }) => {
    const count = completedTasks.filter((t) => {
      const date = new Date(t.updatedAt || t.createdAt);
      return date.getDay() === dayIndex;
    }).length;
    return { label, count };
  });

  const maxCount = Math.max(...countsPerDay.map((d) => d.count), 1);

  const days = countsPerDay.map((d) => ({
    day: d.label,
    count: d.count,
    height: d.count === 0 ? '4px' : `${Math.max(15, Math.round((d.count / maxCount) * 100))}%`,
  }));

  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Năng suất Hoàn thành Tuần này</CardTitle>
        <CardDescription className="text-xs">Số lượng công việc hoàn thành mỗi ngày trong tuần.</CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        <div className="h-36 flex items-end justify-between gap-2 pt-4 px-2 border-b border-border/60">
          {days.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                {d.count}
              </span>
              <div
                style={{ height: d.height }}
                className={`w-full max-w-7 rounded-t-md transition-all duration-300 relative ${
                  d.count > 0 ? 'bg-primary/80 hover:bg-primary group-hover:shadow-md' : 'bg-muted/60'
                }`}
              />
              <span className="text-[10px] font-medium text-muted-foreground mt-1">{d.day}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
