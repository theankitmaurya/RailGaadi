import React from 'react';
import { JourneyStatus } from '@/types';
import { formatDelay } from '@/lib/utils';
import { BarChart3, Navigation2, Clock4, Mountain } from 'lucide-react';

interface MetricCardsProps {
  status: JourneyStatus;
  highestElevationMeters?: number;
}

const metrics = (status: JourneyStatus, elevation: number) => [
  {
    label: 'Journey Complete',
    value: `${status.progress.percentage}%`,
    sub: `${Math.round(status.progress.distanceCoveredKm).toLocaleString('en-IN')} km covered`,
    icon: BarChart3,
    bg: 'bg-indigo-50 dark:bg-indigo-950/60',
    fg: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-100 dark:border-indigo-900/40',
    bar: status.progress.percentage,
  },
  {
    label: 'Distance Covered',
    value: `${Math.round(status.progress.distanceCoveredKm).toLocaleString('en-IN')}`,
    unit: 'km',
    sub: `${Math.round(status.progress.distanceRemainingKm).toLocaleString('en-IN')} km remaining`,
    icon: Navigation2,
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    fg: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-900/40',
  },
  {
    label: 'Delay Impact',
    value: formatDelay(status.delayMinutes).shortText,
    sub: status.delayMinutes <= 0 ? 'Running perfectly on schedule' : 'Expected ETA adjusted',
    icon: Clock4,
    bg: status.delayMinutes > 15 ? 'bg-rose-50 dark:bg-rose-950/60' : status.delayMinutes > 0 ? 'bg-amber-50 dark:bg-amber-950/60' : 'bg-emerald-50 dark:bg-emerald-950/60',
    fg: status.delayMinutes > 15 ? 'text-rose-600 dark:text-rose-400' : status.delayMinutes > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400',
    border: status.delayMinutes > 15 ? 'border-rose-100 dark:border-rose-900/40' : status.delayMinutes > 0 ? 'border-amber-100 dark:border-amber-900/40' : 'border-emerald-100 dark:border-emerald-900/40',
  },
  {
    label: 'Peak Elevation',
    value: elevation.toLocaleString('en-IN'),
    unit: 'm',
    sub: 'Highest point on route',
    icon: Mountain,
    bg: 'bg-violet-50 dark:bg-violet-950/60',
    fg: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-100 dark:border-violet-900/40',
  },
];

export function MetricCards({ status, highestElevationMeters = 493 }: MetricCardsProps) {
  const cards = metrics(status, highestElevationMeters);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className={`relative overflow-hidden rounded-2xl bg-white dark:bg-[#0f1117] border ${card.border} p-5 shadow-sm hover:shadow-md transition-all duration-200`}>
            {/* Background blob */}
            <div className={`pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full ${card.bg} blur-2xl opacity-60`} />

            <div className="relative">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.bg} mb-3`}>
                <Icon className={`w-4.5 h-4.5 ${card.fg}`} />
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">{card.value}</span>
                {card.unit && <span className="text-sm font-bold text-slate-400 dark:text-slate-500">{card.unit}</span>}
              </div>

              <div className="label-section mb-1">{card.label}</div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug">{card.sub}</div>

              {/* Mini progress bar */}
              {card.bar !== undefined && (
                <div className="mt-3 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-violet-500 rounded-full transition-all duration-700"
                    style={{ width: `${card.bar}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
