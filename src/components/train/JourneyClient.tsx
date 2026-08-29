'use client';

import React, { useState } from 'react';
import { useJourneyStatus } from '@/hooks/useJourneyStatus';
import { useTrainRoute } from '@/hooks/useTrainRoute';
import { TrainHeader } from '@/components/train/TrainHeader';
import { CurrentStationCard } from '@/components/train/CurrentStationCard';
import { NextStationCard } from '@/components/train/NextStationCard';
import { JourneyProgress } from '@/components/train/JourneyProgress';
import { MetricCards } from '@/components/analytics/MetricCards';
import { ElevationChart } from '@/components/analytics/ElevationChart';
import { StationTimeline } from '@/components/timeline/StationTimeline';
import { WeatherCard } from '@/components/weather/WeatherCard';
import { NearbyPlaces } from '@/components/nearby/NearbyPlaces';
import { ShareModal } from '@/components/train/ShareModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Train } from '@/types';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, RefreshCw, Clock } from 'lucide-react';

const JourneyMap = dynamic(() => import('@/components/map/JourneyMap').then((m) => m.JourneyMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[360px] sm:min-h-[480px] rounded-2xl sm:rounded-3xl bg-slate-950 flex items-center justify-center border border-slate-800">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium text-slate-400">Loading map...</span>
      </div>
    </div>
  ),
});

export function JourneyClient({ trainId }: { trainId: string }) {
  const { data: status, isLoading: isStatusLoading, error: statusError, refetch } = useJourneyStatus(trainId);
  const { data: route, isLoading: isRouteLoading } = useTrainRoute(trainId);
  const [favourites, setFavourites] = useLocalStorage<Train[]>('rg_favourite_trains', []);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { data: weatherData } = useQuery({
    queryKey: ['weather', trainId],
    queryFn: async () => {
      const res = await fetch(`/api/journeys/${trainId}/weather`);
      return (await res.json()).data;
    },
    enabled: !!status,
  });

  const { data: elevationData } = useQuery({
    queryKey: ['elevation', trainId],
    queryFn: async () => {
      const res = await fetch(`/api/journeys/${trainId}/elevation`);
      return (await res.json()).data;
    },
    enabled: !!status,
  });

  const { data: nearbyData } = useQuery({
    queryKey: ['nearby', trainId],
    queryFn: async () => {
      const res = await fetch(`/api/journeys/${trainId}/nearby`);
      return (await res.json()).data;
    },
    enabled: !!status,
  });

  // ── Skeleton ──────────────────────────────────────────
  if (isStatusLoading || isRouteLoading) {
    return (
      <div className="mx-auto max-w-[1280px] px-3.5 sm:px-6 lg:px-10 py-4 sm:py-8 space-y-4 sm:space-y-5">
        {[28, 12, 96, 24].map((h, i) => (
          <div key={i} className={`h-${h} shimmer rounded-2xl`} style={{ height: h * 4 }} />
        ))}
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────
  if (statusError || !status || !route) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:py-20 text-center space-y-4 sm:space-y-5">
        <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/60 mx-auto">
          <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-rose-500" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Journey Unavailable</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 sm:mt-2">
            We couldn&apos;t load live status for train <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{trainId}</span>.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-bold rounded-xl cursor-pointer hover:bg-slate-800 dark:hover:bg-white transition-colors shadow-md"
        >
          <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  const isFav = favourites.some((f) => f.id === status.train.id);
  const toggleFav = () => {
    if (isFav) setFavourites((prev) => prev.filter((f) => f.id !== status.train.id));
    else setFavourites((prev) => [...prev, status.train]);
  };

  // Stale-data check
  const lastUpdatedMs = Date.now() - new Date(status.lastUpdated).getTime();
  const isStale = lastUpdatedMs > 5 * 60 * 1000;

  return (
    <div className="mx-auto max-w-[1280px] px-3.5 sm:px-6 lg:px-10 py-4 sm:py-8 space-y-4 sm:space-y-5">

      {/* Stale Banner */}
      {isStale && (
        <div className="flex items-center gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-900/60 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-amber-700 dark:text-amber-300">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>Data last updated {Math.round(lastUpdatedMs / 60000)} min ago — live status may be delayed.</span>
        </div>
      )}

      {/* Train Identity Header */}
      <TrainHeader
        status={status}
        isFavourite={isFav}
        onToggleFavourite={toggleFav}
        onShare={() => setIsShareModalOpen(true)}
      />

      {/* Progress + Station Pair */}
      <JourneyProgress progress={status.progress} train={status.train} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        <CurrentStationCard station={status.currentStation} delayMinutes={status.delayMinutes} />
        <NextStationCard station={status.nextStation} currentDistanceKm={status.progress.distanceCoveredKm} />
      </div>

      {/* Map + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        <div className="lg:col-span-8 h-[360px] sm:h-[480px]">
          <JourneyMap status={status} route={route} />
        </div>
        <div className="lg:col-span-4">
          <StationTimeline stations={route.stations} />
        </div>
      </div>

      {/* Analytics Section */}
      <div className="pt-2 space-y-4 sm:space-y-5">
        <div className="flex items-center gap-3">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">Journey Intelligence</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent" />
        </div>

        <MetricCards status={status} highestElevationMeters={elevationData?.highestElevationMeters} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          <ElevationChart elevationData={elevationData} />
          <WeatherCard weather={weatherData} />
        </div>

        <NearbyPlaces features={nearbyData} />
      </div>

      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} train={status.train} />
    </div>
  );
}
