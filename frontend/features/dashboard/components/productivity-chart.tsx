'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export function ProductivityChart() {
  // Weekly trend dummy data (Mon - Sun)
  const days = [
    { day: 'Th 2', count: 4, height: '40%' },
    { day: 'Th 3', count: 7, height: '70%' },
    { day: 'Th 4', count: 5, height: '50%' },
    { day: 'Th 5', count: 9, height: '90%' },
    { day: 'Th 6', count: 6, height: '60%' },
    { day: 'Th 7', count: 3, height: '30%' },
    { day: 'CN', count: 2, height: '20%' },
  ];

  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Năng suất Hoàn thành Tuần này</CardTitle>
        <CardDescription className="text-xs">Số lượng công việc hoàn thành mỗi ngày.</CardDescription>
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
                className="w-full max-w-7 bg-primary/20 hover:bg-primary group-hover:shadow-md rounded-t-md transition-all duration-300 relative"
              />
              <span className="text-[10px] font-medium text-muted-foreground mt-1">{d.day}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
