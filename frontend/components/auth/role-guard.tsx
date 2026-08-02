'use client';

import * as React from 'react';
import { WorkspaceRole } from '@/features/workspace/types/workspace';
import { useRole } from '@/features/workspace/hooks/use-role';

interface RoleGuardProps {
  workspaceId: string;
  allowedRoles: WorkspaceRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({
  workspaceId,
  allowedRoles,
  children,
  fallback = null,
}: RoleGuardProps) {
  const { role, isLoading } = useRole(workspaceId);

  if (isLoading) return null;

  if (role && allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
