'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StationLiveTrain } from '@/services/analytics';
import { StationInfo } from '@/types';
import {
  Building2,
  Clock,
  ArrowRight,
  Wifi,
  Sparkles,
  Search,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function StationPage() {
  const params = useParams();
  const stationCode = (params.stationCode as string)?.toUpperCase() || 'NDLS';

  const [station, setStation] = useState<StationInfo | null>(null);
  const [trains, setTrains] = useState<StationLiveTrain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'departed' | 'upcoming' | 'at-station'>('all');

  const fetchStationData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/stations/${stationCode}/live?hours=4`);
      const json = await res.json();
      if (json.success && json.data) {
        setStation(json.data.station);
        setTrains(json.data.trains || []);
      }
    } catch (err) {
      console.error('Failed to load station data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationCode]);

  const filteredTrains = trains.filter((t) => {
    if (filterType === 'all') return true;
    return t.status === filterType;
  });

  return (
    <main className="min-h-screen pb-20 bg-slate-50/50 text-slate-900">
      {/* Station Hero Header */}
      <div className="relative border-b border-slate-200/80 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/25">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                    {station?.name || stationCode}
                  </h1>
                  <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-slate-900 text-white">
                    {stationCode}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {station?.city ? `${station.city}, ${station.state || 'India'}` : 'Indian Railways Station'} · {station?.platforms || 6} Platforms
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStationData}
                disabled={isLoading}
                className="text-xs gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Board</span>
              </Button>
              <Link href={`/planner?from=${stationCode}`}>
                <Button size="sm" variant="primary" className="text-xs gap-1.5 cursor-pointer">
                  <span>Plan Journey</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Verified Amenities */}
          {station?.facilities && (
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400">Station Amenities:</span>
              {station.facilities.map((fac) => (
                <span
                  key={fac}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {fac}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live Board Container */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Live Platform Board (Next 4 Hours)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-mono text-slate-500">
                {filteredTrains.length} trains
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Indian Railways platform assignments, delays, and arrival statuses.
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80">
            {(['all', 'at-station', 'upcoming', 'departed'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterType(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  filterType === mode
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mode === 'all' ? 'All Trains' : mode.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Train Table / Cards */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filteredTrains.length === 0 ? (
          <Card className="p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              No Trains In This Window
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No trains matched your filter in the current 4-hour live window.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredTrains.map((train) => {
              const isAtStation = train.status === 'at-station';
              const isDelayed = train.delayMinutes > 0;

              return (
                <div
                  key={`${train.trainNumber}-${train.scheduledDeparture || train.scheduledArrival}`}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:border-indigo-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  {/* Left info */}
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 text-slate-900">
                        {train.trainNumber}
                      </span>
                      <span className="mt-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                        Plat {train.platform}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 leading-snug">
                        {train.trainName}
                      </h3>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {train.source} → {train.destination} · <span className="text-slate-500 font-medium">{train.trainType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Timing & Status */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="text-xs sm:text-sm font-bold font-mono text-slate-900">
                        {train.scheduledDeparture || train.scheduledArrival || '--:--'}
                      </div>
                      <div className="text-[10px] font-bold">
                        {isDelayed ? (
                          <span className="text-amber-600">+{train.delayMinutes}m delay</span>
                        ) : (
                          <span className="text-emerald-600">On time</span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                        isAtStation
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-200 animate-pulse'
                          : train.status === 'departed'
                          ? 'bg-slate-100 text-slate-500 border-slate-200'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}
                    >
                      {train.status === 'at-station' ? 'At Station' : train.status}
                    </span>

                    <Link href={`/journey/${train.trainNumber}`}>
                      <Button size="sm" variant="outline" className="text-xs py-1.5 cursor-pointer">
                        <Wifi className="w-3 h-3 mr-1" />
                        Track
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
