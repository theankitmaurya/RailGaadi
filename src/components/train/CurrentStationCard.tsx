import React from 'react';
import { RouteStation } from '@/types';
import { MapPin, Clock } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface CurrentStationCardProps {
  station?: RouteStation;
  delayMinutes?: number;
}

export function CurrentStationCard({ station, delayMinutes = 0 }: CurrentStationCardProps) {
  if (!station) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0f1117] border border-indigo-100 dark:border-indigo-950/60 shadow-sm p-5">
      {/* Background blob */}
      <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-indigo-500/8 dark:bg-indigo-500/10 blur-2xl" />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/80">
          <MapPin className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400" />
        </div>
        <span className="label-section text-indigo-600 dark:text-indigo-400">Currently At</span>
        <div className="ml-auto flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/60 dark:border-indigo-800 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          LIVE
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">{station.station.name}</h3>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{station.station.code}</span>
        {station.station.state && (
          <>
            <span className="text-slate-200 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">{station.station.state}</span>
          </>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-slate-400 dark:text-slate-500 mb-0.5">Arrived</div>
          <div className="font-bold text-slate-800 dark:text-slate-200 font-mono">{formatTime(station.actualArrival || station.scheduledArrival)}</div>
        </div>
        {station.scheduledDeparture && (
          <div>
            <div className="text-slate-400 dark:text-slate-500 mb-0.5">Departed</div>
            <div className="font-bold text-slate-800 dark:text-slate-200 font-mono">{formatTime(station.actualDeparture || station.scheduledDeparture)}</div>
          </div>
        )}
        {station.platform && (
          <div className="text-right">
            <div className="text-slate-400 dark:text-slate-500 mb-0.5">Platform</div>
            <div className="font-black text-slate-900 dark:text-slate-100 text-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg inline-block">PF {station.platform}</div>
          </div>
        )}
      </div>

      {delayMinutes > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-900/60 px-3 py-1.5 rounded-lg">
          <Clock className="w-3.5 h-3.5" />
          <span>Running {delayMinutes} min late</span>
        </div>
      )}
    </div>
  );
}
