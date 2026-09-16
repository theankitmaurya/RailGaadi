'use client';

import React from 'react';
import Link from 'next/link';
import { History, Trash2 } from 'lucide-react';
import { Train } from '@/types';

interface RecentSearchesProps {
  recents: Train[];
  onClear: () => void;
  onRemove: (trainId: string) => void;
}

export function RecentSearches({ recents, onClear, onRemove }: RecentSearchesProps) {
  if (!recents || recents.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <History className="h-3.5 w-3.5" />
          <span>Recent Searches</span>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {recents.map((train) => (
          <div
            key={train.id}
            className="group relative flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 hover:border-slate-300 hover:shadow-xs transition-all"
          >
            <Link href={`/journey/${train.id}`} className="flex-1 pr-2 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900">{train.number}</span>
                <span className="text-xs font-semibold text-slate-700 truncate">{train.name}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {train.originName} → {train.destinationName}
              </p>
            </Link>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove(train.id);
              }}
              className="text-slate-300 hover:text-rose-500 p-1 rounded-md transition-colors cursor-pointer flex-shrink-0"
              title="Remove from recents"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
