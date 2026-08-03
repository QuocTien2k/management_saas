import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  variant?: 'global' | 'scope';
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Loading({
  variant = 'scope',
  text,
  size = 'md',
  className,
}: LoadingProps) {
  // Định nghĩa kích thước spinner
  const spinnerSizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-[3px]',
    lg: 'h-16 w-16 border-4',
  };

  const isGlobal = variant === 'global';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 select-none transition-all duration-300',
        isGlobal
          ? 'fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md'
          : 'absolute inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] rounded-lg',
        className
      )}
    >
      <div
        className={cn(
          'rounded-full border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin',
          spinnerSizes[size]
        )}
      />
      {text && (
        <p
          className={cn(
            'font-medium tracking-wide animate-pulse',
            isGlobal ? 'text-sm text-slate-400' : 'text-xs text-slate-300'
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
}
