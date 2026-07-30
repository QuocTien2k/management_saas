import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAuthInputClass(hasError: boolean, extraClasses?: string) {
  return cn(
    "bg-slate-950/60 border-slate-800 text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500",
    hasError && "border-rose-500 focus:ring-rose-500",
    extraClasses
  );
}
