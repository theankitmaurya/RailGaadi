import React from 'react';
import { RouteStation } from '@/types';
import { Navigation } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface NextStationCardProps {
  station?: RouteStation;
  currentDistanceKm?: number;
}

export function NextStationCard({ station, currentDistanceKm = 0 }: NextStationCardProps) {
  if (!station) return null;

  const distanceToNext = Math.max(0, station.distanceFromOriginKm - currentDistanceKm);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm p-5">
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-slate-500/5 blur-2xl" />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
          <Navigation className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <span className="label-section">Next Stop</span>
      </div>

      <h3 className="text-lg font-bold text-slate-900 leading-snug">{station.station.name}</h3>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="font-mono text-xs text-slate-400">{station.station.code}</span>
        {station.station.state && (
          <>
            <span className="text-slate-200">·</span>
            <span className="text-xs text-slate-400">{station.station.state}</span>
          </>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-slate-400 mb-0.5">Expected ETA</div>
          <div className="font-bold text-slate-800 font-mono text-sm">{formatTime(station.scheduledArrival)}</div>
        </div>
        <div>
          <div className="text-slate-400 mb-0.5">Distance</div>
          <div className="font-black text-indigo-600 text-sm">
            {distanceToNext > 0 ? `${Math.round(distanceToNext)} km` : 'Approaching'}
          </div>
        </div>
      </div>
    </div>
  );
}
