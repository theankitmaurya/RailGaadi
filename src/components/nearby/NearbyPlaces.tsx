import React from 'react';
import { NearbyFeature } from '@/types';
import { Compass, Waves, Mountain, Landmark, Trees, Tent } from 'lucide-react';

interface NearbyPlacesProps {
  features?: NearbyFeature[];
}

const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  RIVER: { icon: Waves, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60', border: 'border-blue-100 dark:border-blue-900/40' },
  LAKE:  { icon: Waves, color: 'text-sky-500 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/60', border: 'border-sky-100 dark:border-sky-900/40' },
  MOUNTAIN: { icon: Mountain, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60', border: 'border-amber-100 dark:border-amber-900/40' },
  GHAT:  { icon: Mountain, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/60', border: 'border-orange-100 dark:border-orange-900/40' },
  BRIDGE:   { icon: Landmark, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/60', border: 'border-slate-200 dark:border-slate-700/60' },
  TUNNEL:   { icon: Tent, color: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/60', border: 'border-violet-100 dark:border-violet-900/40' },
  MONUMENT: { icon: Landmark, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/60', border: 'border-rose-100 dark:border-rose-900/40' },
  ATTRACTION: { icon: Compass, color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/60', border: 'border-indigo-100 dark:border-indigo-900/40' },
  CITY: { icon: Trees, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60', border: 'border-emerald-100 dark:border-emerald-900/40' },
};

export function NearbyPlaces({ features = [] }: NearbyPlacesProps) {
  if (!features || !features.length) return null;

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0f1117] border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/80">
            <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Smart Travel Companion</div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500">Nearby geographic highlights</div>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 px-2 py-1 rounded-lg font-medium">
          {features.length} nearby
        </span>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-50 dark:divide-slate-800/60">
        {features.map((feature) => {
          const cfg = categoryConfig[feature.category] || categoryConfig.ATTRACTION;
          const Icon = cfg.icon;

          return (
            <div key={feature.id} className="group p-5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors duration-150">
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl ${cfg.bg} border ${cfg.border}`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">{feature.name}</span>
                    <span className={`text-[10px] font-bold ${cfg.color} ${cfg.bg} border ${cfg.border} px-2 py-0.5 rounded-full`}>
                      ~{feature.distanceFromTrainKm} km
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">{feature.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
