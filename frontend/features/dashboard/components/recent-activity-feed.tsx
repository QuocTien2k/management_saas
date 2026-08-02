'use client';

import * as React from 'react';
import { ActivityIcon, CheckCircle2Icon, PlusCircleIcon, MessageSquareIcon, UserPlusIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export function RecentActivityFeed() {
  const activities = [
    {
      id: '1',
      user: 'Nguyễn Văn A',
      action: 'đã hoàn thành công việc',
      target: 'Thiết kế UI Dashboard',
      time: '10 phút trước',
      icon: <CheckCircle2Icon className="size-3.5 text-emerald-500" />,
    },
    {
      id: '2',
      user: 'Trần Thị B',
      action: 'đã thêm bình luận mới vào',
      target: 'Tích hợp Socket.IO Realtime',
      time: '35 phút trước',
      icon: <MessageSquareIcon className="size-3.5 text-blue-500" />,
    },
    {
      id: '3',
      user: 'Phạm Minh C',
      action: 'đã tạo dự án mới',
      target: 'Mobile App React Native',
      time: '2 giờ trước',
      icon: <PlusCircleIcon className="size-3.5 text-indigo-500" />,
    },
    {
      id: '4',
      user: 'Lê Hoàng D',
      action: 'đã tham gia workspace',
      target: 'Nhóm Phát triển Hệ thống',
      time: '5 giờ trước',
      icon: <UserPlusIcon className="size-3.5 text-amber-500" />,
    },
  ];

  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ActivityIcon className="size-4 text-primary" />
          <CardTitle className="text-base font-semibold">Nhật ký Hoạt động Gần đây</CardTitle>
        </div>
        <CardDescription className="text-xs">Theo dõi lịch sử thay đổi thực tế trong nhóm.</CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-1 space-y-3">
        {activities.map((act) => (
          <div key={act.id} className="flex items-start gap-3 text-xs p-2 rounded-xl hover:bg-muted/40 transition-colors">
            <div className="size-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 mt-0.5 border border-border/50">
              {act.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground leading-snug">
                <span className="font-semibold text-foreground">{act.user}</span>{' '}
                <span className="text-muted-foreground">{act.action}</span>{' '}
                <span className="font-semibold text-primary">{act.target}</span>
              </p>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">{act.time}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
