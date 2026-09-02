'use client';

import React from 'react';
import { CheckCheck } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <aside
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-stone-900 text-white px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-150"
    >
      <div className="w-4 h-4 rounded-md bg-orange-500 flex items-center justify-center text-white shrink-0">
        <CheckCheck className="w-2.5 h-2.5" />
      </div>
      <span className="text-xs font-medium tracking-tight lowercase first-letter:capitalize">
        {message}
      </span>
    </aside>
  );
}
