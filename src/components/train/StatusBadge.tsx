import React from 'react';
import { RunningState } from '@/types';
import { getRunningStateInfo } from '@/lib/utils';
import { Clock, CheckCircle2, AlertTriangle, AlertCircle, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  state: RunningState;
  delayMinutes?: number;
  className?: string;
}

export function StatusBadge({ state, delayMinutes = 0, className }: StatusBadgeProps) {
  const info = getRunningStateInfo(state, delayMinutes);

  const getIcon = () => {
    switch (state) {
      case 'ON_TIME':
      case 'EARLY':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'DELAYED':
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'NOT_STARTED':
        return <PlayCircle className="w-3.5 h-3.5" />;
      case 'COMPLETED':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-xs',
        info.colorClass,
        className
      )}
    >
      {getIcon()}
      <span>{info.label}</span>
    </span>
  );
}
