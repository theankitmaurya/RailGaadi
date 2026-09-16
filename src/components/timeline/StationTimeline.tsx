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
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <span className="text-sm font-bold text-slate-900">Station Timeline</span>
        </div>
        <span className="text-xs text-slate-400">
          {stations.filter((s) => s.status === 'PASSED').length} of {stations.length} stations
        </span>
      </div>

      {/* Scrollable List */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
        {stations.map((s, idx) => {
          const isPassed = s.status === 'PASSED';
          const isCurrent = s.status === 'CURRENT';
          const isFirst = idx === 0;
          const isLast = idx === stations.length - 1;

          return (
            <div
              key={`${s.station.id || s.station.code || 'stn'}-${s.sequence ?? idx}-${idx}`}
              className={`relative flex items-start gap-3 px-5 py-3.5 transition-colors ${
                isCurrent ? 'bg-indigo-50/60' : ''
              }`}
            >
              {/* Timeline Spine + Dot */}
              <div className="flex flex-col items-center flex-shrink-0 pt-1" style={{ width: 20 }}>
                {/* Top line */}
                {!isFirst && (
                  <div className={`w-0.5 flex-1 -mt-3.5 mb-1.5 min-h-[14px] ${isPassed || isCurrent ? 'bg-indigo-400' : 'bg-slate-200'}`} />
                )}
                {/* Dot */}
                <div
                  className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${
                    isCurrent
                      ? 'bg-indigo-600 ring-4 ring-indigo-200 animate-pulse'
                      : isPassed
                      ? 'bg-indigo-500 border-2 border-white shadow-sm'
                      : 'bg-white border-2 border-slate-300'
                  }`}
                />
                {/* Bottom line */}
                {!isLast && (
                  <div className={`w-0.5 flex-1 mt-1.5 -mb-3.5 min-h-[14px] ${isPassed ? 'bg-indigo-400' : 'bg-slate-200'}`} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-bold leading-snug truncate ${isCurrent ? 'text-indigo-700' : isPassed ? 'text-slate-800' : 'text-slate-400'}`}>
                      {s.station.name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{s.station.code}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">CURRENT</span>
                    )}
                    {(isFirst) && (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">ORIGIN</span>
                    )}
                    {(isLast) && (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">DESTINATION</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{Math.round(s.distanceFromOriginKm)} km</div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className={`text-xs font-bold font-mono ${isCurrent ? 'text-indigo-700' : isPassed ? 'text-slate-700' : 'text-slate-400'}`}>
                    {formatTime(s.actualArrival || s.scheduledArrival)}
                  </div>
                  {s.delayMinutes > 0 ? (
                    <div className="text-[10px] font-bold text-amber-600 mt-0.5">+{s.delayMinutes}m</div>
                  ) : isPassed || isCurrent ? (
                    <div className="text-[10px] font-bold text-emerald-600 mt-0.5">On time</div>
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
