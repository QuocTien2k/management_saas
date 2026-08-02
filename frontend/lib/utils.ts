import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAuthInputClass(hasError: boolean, extraClasses?: string) {
  return cn(
    "bg-background/80 border-input text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all",
    hasError && "border-destructive focus-visible:ring-destructive",
    extraClasses
  );
}
