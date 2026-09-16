'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ArrowRight, BookmarkX } from 'lucide-react';
import { Train } from '@/types';

interface FavouriteTrainsProps {
  favourites: Train[];
  onRemove?: (trainId: string) => void;
}

export function FavouriteTrains({ favourites, onRemove }: FavouriteTrainsProps) {
  if (!favourites || favourites.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>Saved Trains</span>
        </div>
        <div className="rounded-2xl border border-dashed border-amber-200/60 bg-amber-50/20 p-5 text-center">
          <Star className="h-6 w-6 text-amber-400/60 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">No saved trains yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Press ☆ on any train to save it here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        <span>Saved Trains</span>
        <span className="ml-auto font-bold text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full text-[11px]">
          {favourites.length}
        </span>
      </div>

      <div className="space-y-2">
        {favourites.map((train) => (
          <div
            key={train.id}
            className="group flex items-center gap-2 rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50/60 to-amber-50/20 p-3.5 hover:border-amber-300/60 transition-all"
          >
            {/* Star icon */}
            <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 border border-amber-200/60">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            </div>

            {/* Info */}
            <Link href={`/journey/${train.id}`} className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-slate-900">{train.number}</span>
                <span className="text-xs font-bold text-slate-800 truncate">{train.name}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {train.originName} → {train.destinationName}
              </p>
            </Link>

            {/* Remove + Go */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {onRemove && (
                <button
                  onClick={() => onRemove(train.id)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove from saved"
                >
                  <BookmarkX className="h-3.5 w-3.5" />
                </button>
              )}
              <Link
                href={`/journey/${train.id}`}
                className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-100 transition-colors"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
