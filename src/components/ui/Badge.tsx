import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'accent' | 'outline';
}

export function Badge({ children, variant = 'neutral', className, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-emerald-500/10',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/60 ring-amber-500/10',
    error: 'bg-rose-50 text-rose-700 border-rose-200/60 ring-rose-500/10',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/60 ring-slate-500/10',
    accent: 'bg-indigo-50 text-indigo-700 border-indigo-200/60 ring-indigo-500/10',
    outline: 'bg-white text-slate-700 border-slate-300 ring-slate-400/10',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors shadow-2xs',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
