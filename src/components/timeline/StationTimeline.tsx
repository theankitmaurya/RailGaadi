import React from 'react';
import { RouteStation } from '@/types';
import { Clock } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface StationTimelineProps {
  stations: RouteStation[];
}

export function StationTimeline({ stations }: StationTimelineProps) {
  if (!stations || !stations.length) return null;

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0f1117] border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Station Timeline</span>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {stations.filter((s) => s.status === 'PASSED').length} of {stations.length} stations
        </span>
      </div>

      {/* Scrollable List */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
        {stations.map((s, idx) => {
          const isPassed = s.status === 'PASSED';
          const isCurrent = s.status === 'CURRENT';
          const isFirst = idx === 0;
          const isLast = idx === stations.length - 1;

          return (
            <div
              key={s.station.id}
              className={`relative flex items-start gap-3 px-5 py-3.5 transition-colors ${
                isCurrent ? 'bg-indigo-50/60 dark:bg-indigo-950/40' : ''
              }`}
            >
              {/* Timeline Spine + Dot */}
              <div className="flex flex-col items-center flex-shrink-0 pt-1" style={{ width: 20 }}>
                {/* Top line */}
                {!isFirst && (
                  <div className={`w-0.5 flex-1 -mt-3.5 mb-1.5 min-h-[14px] ${isPassed || isCurrent ? 'bg-indigo-400 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                )}
                {/* Dot */}
                <div
                  className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${
                    isCurrent
                      ? 'bg-indigo-600 dark:bg-indigo-400 ring-4 ring-indigo-200 dark:ring-indigo-950 animate-pulse'
                      : isPassed
                      ? 'bg-indigo-500 border-2 border-white dark:border-slate-900 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700'
                  }`}
                />
                {/* Bottom line */}
                {!isLast && (
                  <div className={`w-0.5 flex-1 mt-1.5 -mb-3.5 min-h-[14px] ${isPassed ? 'bg-indigo-400 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-bold leading-snug truncate ${isCurrent ? 'text-indigo-700 dark:text-indigo-300' : isPassed ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
                      {s.station.name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{s.station.code}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-full">CURRENT</span>
                    )}
                    {(isFirst) && (
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">ORIGIN</span>
                    )}
                    {(isLast) && (
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">DESTINATION</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">{Math.round(s.distanceFromOriginKm)} km</div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className={`text-xs font-bold font-mono ${isCurrent ? 'text-indigo-700 dark:text-indigo-300' : isPassed ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
                    {formatTime(s.actualArrival || s.scheduledArrival)}
                  </div>
                  {s.delayMinutes > 0 ? (
                    <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">+{s.delayMinutes}m</div>
                  ) : isPassed || isCurrent ? (
                    <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">On time</div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
