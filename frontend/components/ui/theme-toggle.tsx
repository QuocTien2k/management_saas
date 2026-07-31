'use client';

import * as React from 'react';
import { SunIcon, MoonIcon, LaptopIcon } from 'lucide-react';
import { useTheme } from '@/providers/theme-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-background/80 text-muted-foreground backdrop-blur-md transition-colors cursor-pointer dark:bg-card/80"
      >
        <SunIcon className="size-4" />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            aria-label="Toggle theme"
            className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-background/80 text-muted-foreground hover:text-foreground backdrop-blur-md transition-colors cursor-pointer dark:bg-card/80"
          >
            {resolvedTheme === 'dark' ? (
              <MoonIcon className="size-4 text-blue-400 transition-all duration-200" />
            ) : (
              <SunIcon className="size-4 text-amber-500 transition-all duration-200" />
            )}
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-36 backdrop-blur-md bg-popover/90 border border-border/80">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={`flex items-center gap-2 cursor-pointer ${
            theme === 'light' ? 'font-semibold text-primary' : ''
          }`}
        >
          <SunIcon className="size-4 text-amber-500" />
          <span>Sáng (Light)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-2 cursor-pointer ${
            theme === 'dark' ? 'font-semibold text-primary' : ''
          }`}
        >
          <MoonIcon className="size-4 text-blue-400" />
          <span>Tối (Dark)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={`flex items-center gap-2 cursor-pointer ${
            theme === 'system' ? 'font-semibold text-primary' : ''
          }`}
        >
          <LaptopIcon className="size-4 text-muted-foreground" />
          <span>Hệ thống</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
