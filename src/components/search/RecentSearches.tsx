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
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <History className="h-3.5 w-3.5" />
          <span>Recent Searches</span>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {recents.map((train) => (
          <div
            key={train.id}
            className="group relative flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all"
          >
            <Link href={`/journey/${train.id}`} className="flex-1 pr-2 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{train.number}</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{train.name}</span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                {train.originName} → {train.destinationName}
              </p>
            </Link>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove(train.id);
              }}
              className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 p-1 rounded-md transition-colors cursor-pointer flex-shrink-0"
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
