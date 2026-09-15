import React from 'react';
import { JourneyProgress as IProgress } from '@/types';
import { Train } from '@/types';

interface JourneyProgressProps {
  progress: IProgress;
  train: Train;
}

export function JourneyProgress({ progress, train }: JourneyProgressProps) {
  const percentage = Math.min(100, Math.max(0, progress.percentage));

  return (
    <div className="w-full bg-white dark:bg-[#0f1117] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:px-6 sm:py-5 shadow-sm">
      {/* Top Row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="label-section mb-0.5">Journey Progress</div>
          <div className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">{Math.round(progress.distanceCoveredKm).toLocaleString('en-IN')}</span> km of{' '}
            <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">{Math.round(train.totalDistanceKm).toLocaleString('en-IN')}</span> km
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{percentage}<span className="text-base sm:text-lg font-bold text-slate-400">%</span></div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium">complete</div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative w-full h-2 sm:h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-indigo-500 to-violet-500 rounded-full transition-all duration-700 ease-out shadow-sm"
          style={{ width: `${percentage}%` }}
        />
        {/* Glow */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full blur-sm opacity-50 transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Station Labels */}
      <div className="flex items-center justify-between mt-3 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[90px] sm:max-w-[140px]">{train.originName}</span>
        </div>
        <div className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-mono flex-shrink-0">{Math.round(progress.distanceRemainingKm).toLocaleString('en-IN')} km left</div>
        <div className="flex items-center gap-1.5 min-w-0 justify-end">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[90px] sm:max-w-[140px] text-right">{train.destinationName}</span>
          <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}
