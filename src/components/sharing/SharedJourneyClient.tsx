'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { StatusBadge } from '@/components/train/StatusBadge';
import { CurrentStationCard } from '@/components/train/CurrentStationCard';
import { NextStationCard } from '@/components/train/NextStationCard';
import { JourneyProgress } from '@/components/train/JourneyProgress';
import { Skeleton } from '@/components/ui/Skeleton';
import { ShareTokenData } from '@/types';
import { ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function SharedJourneyClient({ token }: { token: string }) {
  const { data, isLoading, error } = useQuery<{ data: ShareTokenData }>({
    queryKey: ['sharedJourney', token],
    queryFn: async () => {
      const res = await fetch(`/api/shared/${token}`);
      if (!res.ok) throw new Error('Shared journey link expired or invalid');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 space-y-6 animate-pulse">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <Clock className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Shared Link Expired</h2>
        <p className="text-sm text-slate-500">This live journey tracking link is no longer active.</p>
        <Link href="/" className="inline-block px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold">
          Back to Home
        </Link>
      </div>
    );
  }

  const { status } = data.data;
  const { train } = status;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Shared Banner Indicator */}
      <div className="flex items-center justify-between rounded-xl bg-indigo-50 border border-indigo-100 p-3 text-xs text-indigo-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Shared Live Train Tracking View</span>
        </div>
        <span className="text-[10px] text-indigo-500 font-mono">
          Updated {new Date(status.lastUpdated).toLocaleTimeString()}
        </span>
      </div>

      {/* Train Identity Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                {train.number}
              </span>
              <h1 className="text-2xl font-bold text-slate-900">{train.name}</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {train.originName} → {train.destinationName}
            </p>
          </div>
          <StatusBadge state={status.state} delayMinutes={status.delayMinutes} />
        </div>
      </div>

      <JourneyProgress progress={status.progress} train={train} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CurrentStationCard station={status.currentStation} delayMinutes={status.delayMinutes} />
        <NextStationCard
          station={status.nextStation}
          currentDistanceKm={status.progress.distanceCoveredKm}
        />
      </div>

      <div className="text-center pt-6">
        <Link
          href={`/journey/${train.id}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700"
        >
          <span>Open Full Interactive Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
