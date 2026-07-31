import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface WorkspaceAvatarProps {
  name: string;
  logoUrl?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const colorPairs = [
  'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 dark:bg-indigo-500/25',
  'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-500/25',
  'bg-amber-500/15 text-amber-700 dark:text-amber-300 dark:bg-amber-500/25',
  'bg-rose-500/15 text-rose-700 dark:text-rose-300 dark:bg-rose-500/25',
  'bg-purple-500/15 text-purple-700 dark:text-purple-300 dark:bg-purple-500/25',
  'bg-sky-500/15 text-sky-700 dark:text-sky-300 dark:bg-sky-500/25',
];

export function WorkspaceAvatar({
  name,
  logoUrl,
  className,
  size = 'md',
}: WorkspaceAvatarProps) {
  const getInitials = (text: string) => {
    if (!text) return 'WS';
    const parts = text.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  // Derive stable color based on string hash
  const colorIndex = React.useMemo(() => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % colorPairs.length;
  }, [name]);

  const sizeClasses = {
    sm: 'size-7 text-xs rounded-md',
    md: 'size-9 text-sm rounded-lg',
    lg: 'size-12 text-base rounded-xl',
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {logoUrl && <AvatarImage src={logoUrl} alt={name} />}
      <AvatarFallback
        className={cn(
          'font-semibold rounded-inherit tracking-wider',
          colorPairs[colorIndex]
        )}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
