import React from 'react';
import { JourneyWeather } from '@/types';
import { Wind, Droplets, Cloud } from 'lucide-react';

interface WeatherCardProps {
  weather?: JourneyWeather;
}

export function WeatherCard({ weather }: WeatherCardProps) {
  if (!weather || !weather.current) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#0f1117] border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60">
            <Cloud className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Station Weather</span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 py-4">Weather data currently unavailable.</p>
      </div>
    );
  }

  const current = weather.current;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0f1117] border border-amber-100/80 dark:border-amber-900/40 shadow-sm p-5">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/20 dark:from-amber-950/20 dark:via-[#0f1117] dark:to-[#0f1117] rounded-2xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60">
              <Cloud className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Station Weather</div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500">{current.locationName}</div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">LIVE</span>
        </div>

        {/* Main Temp Display */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl leading-none">{current.conditionIcon}</span>
          <div>
            <div className="text-4xl font-black text-slate-900 dark:text-slate-100">{current.temperatureC}<span className="text-2xl font-bold text-slate-400 dark:text-slate-500">°C</span></div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">{current.condition}</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
            <Droplets className="w-4 h-4 text-blue-500 dark:text-blue-400 mx-auto mb-1" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{current.humidityPercent}%</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500">Humidity</div>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
            <Wind className="w-4 h-4 text-slate-400 dark:text-slate-500 mx-auto mb-1" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{current.windSpeedKph}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500">km/h Wind</div>
          </div>
          {current.precipitationProbability !== undefined && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
              <Cloud className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{current.precipitationProbability}%</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">Rain chance</div>
            </div>
          )}
        </div>

        {/* Route Forecast Strip */}
        {weather.routeForecast && weather.routeForecast.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <div className="label-section mb-2">Along Route</div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {weather.routeForecast.map((f) => (
                <div key={f.stationName} className="flex-shrink-0 flex flex-col items-center gap-1 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 px-3 py-2 min-w-[72px] shadow-xs">
                  <span className="text-lg leading-none">{f.conditionIcon}</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{f.temperatureC}°</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-tight truncate max-w-[60px]">{f.stationName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
