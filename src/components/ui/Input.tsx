import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-slate-50/80 border border-slate-200/80 text-slate-900 placeholder:text-slate-400 text-sm rounded-xl px-4 py-2.5 outline-hidden transition-all duration-200 focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:opacity-50 disabled:cursor-not-allowed',
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
