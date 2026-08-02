'use client';

import * as React from 'react';
import { SunIcon, MoonIcon } from 'lucide-react';
import { useTheme } from '@/providers/theme-provider';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="relative flex size-9 items-center justify-center rounded-xl border border-border/80 bg-background/80 text-muted-foreground backdrop-blur-md transition-all cursor-pointer hover:bg-accent hover:text-foreground"
      >
        <SunIcon className="size-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={isDark ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
      className="relative flex size-9 items-center justify-center rounded-xl border border-border/80 bg-background/80 text-muted-foreground hover:text-foreground backdrop-blur-md transition-all duration-200 cursor-pointer hover:bg-accent dark:bg-card/80 dark:hover:bg-accent/80 overflow-hidden group shadow-xs"
    >
      <SunIcon
        className={`size-4 text-amber-500 absolute transition-all duration-500 ease-in-out transform ${
          isDark
            ? 'rotate-90 scale-0 opacity-0'
            : 'rotate-0 scale-100 opacity-100 group-hover:rotate-45'
        }`}
      />
      <MoonIcon
        className={`size-4 text-blue-400 absolute transition-all duration-500 ease-in-out transform ${
          isDark
            ? 'rotate-0 scale-100 opacity-100 group-hover:-rotate-12'
            : '-rotate-90 scale-0 opacity-0'
        }`}
      />
    </button>
  );
}
