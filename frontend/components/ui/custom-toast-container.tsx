'use client';

import React from 'react';
import { useToastStore } from '@/lib/toast';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function CustomToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full sm:w-96">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-5 ${
            t.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
              : t.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/30 text-rose-200'
              : 'bg-blue-950/80 border-blue-500/30 text-blue-200'
          }`}
        >
          {t.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />}
          {t.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />}
          {t.type === 'info' && <Info className="h-5 w-5 text-blue-400 shrink-0" />}

          <p className="text-sm font-medium flex-1">{t.message}</p>

          <button
            onClick={() => removeToast(t.id)}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 p-1 rounded transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
