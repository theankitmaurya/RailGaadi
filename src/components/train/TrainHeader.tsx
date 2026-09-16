'use client';

import React from 'react';
import { JourneyStatus } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Star, Share2, ArrowRight, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PushNotificationBell } from '@/components/notifications/PushNotificationBell';

interface TrainHeaderProps {
  status: JourneyStatus;
  isFavourite?: boolean;
  onToggleFavourite?: () => void;
  onShare?: () => void;
}

export function TrainHeader({ status, isFavourite = false, onToggleFavourite, onShare }: TrainHeaderProps) {
  const { train } = status;

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-md p-4 sm:p-7">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-white rounded-2xl sm:rounded-3xl" />

      <div className="relative flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Train Identity */}
        <div className="flex-1 min-w-0">
          {/* Number + Name row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-1.5 sm:mb-2">
            <span className="font-mono text-base sm:text-xl font-black tracking-tight text-white bg-slate-900 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl leading-tight shadow-sm">
              {train.number}
            </span>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
              {train.name}
            </h1>
            {onToggleFavourite && (
              <button
                onClick={onToggleFavourite}
                className={`p-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  isFavourite
                    ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                    : 'text-slate-300 hover:text-amber-400 hover:bg-amber-50'
                }`}
                title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
              >
                <Star className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${isFavourite ? 'fill-amber-400 scale-110' : ''}`} />
              </button>
            )}
          </div>

          {/* Route */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 flex-wrap">
            <span className="font-semibold text-slate-700">{train.originName}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
            <span className="font-semibold text-slate-700">{train.destinationName}</span>
            <span className="text-slate-200 hidden xs:inline">·</span>
            <span className="font-mono text-slate-400 text-xs">{Math.round(train.totalDistanceKm).toLocaleString('en-IN')} km</span>
          </div>
        </div>

        {/* Right: Status + Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <StatusBadge state={status.state} delayMinutes={status.delayMinutes} />

          {status.speedKph && status.speedKph > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              <span>{status.speedKph} km/h</span>
            </div>
          )}

          {/* Web Push Notification Bell */}
          <PushNotificationBell trainNumber={train.number} trainName={train.name} />

          {onShare && (
            <Button variant="outline" size="sm" onClick={onShare} className="rounded-xl gap-1.5 ml-auto sm:ml-0">
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Share</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
