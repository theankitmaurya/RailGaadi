'use client';

import React, { useEffect, useState } from 'react';
import { Search, Loader2, Train } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Train as TrainType } from '@/types';
import Link from 'next/link';

interface SearchInputProps {
  onSelectTrain?: (train: TrainType) => void;
  autoFocus?: boolean;
}

export function SearchInput({ onSelectTrain, autoFocus = false }: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TrainType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    let mounted = true;
    setIsLoading(true);
    fetch(`/api/trains/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((d) => { if (mounted) { setResults(d.data || []); setIsLoading(false); } })
      .catch(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [debouncedQuery]);

  const showDropdown = isFocused && query.length >= 2;

  return (
    <div className="relative w-full">
      {/* Input Container */}
      <div className={`relative flex items-center rounded-2xl border bg-white dark:bg-slate-900/90 transition-all duration-200 shadow-md ${
        isFocused
          ? 'border-indigo-400 dark:border-indigo-500 shadow-lg shadow-indigo-500/10 ring-4 ring-indigo-500/20'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}>
        <Search className={`absolute left-3.5 sm:left-4 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-colors duration-200 ${isFocused ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search train number (12951) or name (Rajdhani)..."
          autoFocus={autoFocus}
          className="w-full bg-transparent py-3.5 sm:py-4 pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none font-medium"
        />
        {isLoading && (
          <div className="absolute right-3.5 sm:right-4">
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-indigo-500 dark:text-indigo-400" />
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto">
          <div className="px-3 py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </div>
          {results.map((train) => (
            <Link
              key={train.id}
              href={`/journey/${train.id}`}
              onClick={() => { onSelectTrain?.(train); setQuery(''); setIsFocused(false); }}
              className="flex items-center gap-3 sm:gap-3.5 rounded-xl p-2.5 sm:p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
            >
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 transition-colors flex-shrink-0">
                <Train className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{train.number}</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{train.name}</span>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{train.originName} → {train.destinationName}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[11px] sm:text-xs font-mono text-slate-400 dark:text-slate-500">{train.totalDistanceKm.toLocaleString('en-IN')} km</div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">{train.durationHours}h</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {showDropdown && !isLoading && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-5 sm:px-5 sm:py-6 text-center shadow-xl">
          <div className="text-xl sm:text-2xl mb-1.5 sm:mb-2">🔍</div>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">No trains found for &quot;{query}&quot;</p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1">Try a train number (12951) or name like &quot;Rajdhani&quot;</p>
        </div>
      )}
    </div>
  );
}
