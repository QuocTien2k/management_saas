'use client';

import React from 'react';
import { useNotificationSocket } from '@/features/notification/hooks/use-notification-socket';

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  // Kích hoạt socket lắng nghe thông báo thời gian thực khi user đã đăng nhập
  useNotificationSocket();

  return <>{children}</>;
}
