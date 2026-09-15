'use client';

import React, { useEffect, useState } from 'react';
import { Search, Loader2, Train, Building2, ArrowRight, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Train as TrainType } from '@/types';
import { useRouter } from 'next/navigation';

interface StationResult {
  code: string;
  name: string;
  city: string;
}

interface SearchInputProps {
  onSelectTrain?: (train: TrainType) => void;
  autoFocus?: boolean;
}

export function SearchInput({ onSelectTrain, autoFocus = false }: SearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [trainResults, setTrainResults] = useState<TrainType[]>([]);
  const [stationResults, setStationResults] = useState<StationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q || q.length < 2) {
      setTrainResults([]);
      setStationResults([]);
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);

    const trainsPromise = fetch(`/api/trains/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => (Array.isArray(d.data) ? d.data : []))
      .catch(() => []);

    const stationsPromise = fetch(`/api/stations/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => (d.success && Array.isArray(d.data) ? d.data : []))
      .catch(() => []);

    Promise.all([trainsPromise, stationsPromise]).then(([trains, stations]) => {
      if (mounted) {
        setTrainResults(trains);
        setStationResults(stations);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [debouncedQuery]);

  const handleSelectTrain = (train: TrainType) => {
    onSelectTrain?.(train);
    setIsFocused(false);
    setQuery('');
    router.push(`/journey/${train.id}`);
  };

  const handleSelectStation = (stationCode: string) => {
    setIsFocused(false);
    setQuery('');
    router.push(`/station/${stationCode.toUpperCase()}`);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    // 1. If 4-5 digit number, go straight to journey tracking
    if (/^\d{4,5}$/.test(trimmed)) {
      const match = trainResults.find((t) => t.number === trimmed);
      if (match) {
        handleSelectTrain(match);
      } else {
        setIsFocused(false);
        setQuery('');
        router.push(`/journey/${trimmed}`);
      }
      return;
    }

    // 2. If exact or first train match exists
    if (trainResults.length > 0) {
      handleSelectTrain(trainResults[0]);
      return;
    }

    // 3. If station match exists
    if (stationResults.length > 0) {
      handleSelectStation(stationResults[0].code);
      return;
    }

    // 4. Default to Journey Planner with train search
    setIsFocused(false);
    router.push(`/planner?train=${encodeURIComponent(trimmed)}`);
  };

  const showDropdown = isFocused && query.trim().length >= 2;
  const isDirectNumber = /^\d{4,5}$/.test(query.trim());

  return (
    <div className="relative w-full">
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative w-full">
        <div
          className={`relative flex items-center rounded-2xl border bg-white dark:bg-slate-900/90 transition-all duration-200 shadow-md ${
            isFocused
              ? 'border-indigo-400 dark:border-indigo-500 shadow-lg shadow-indigo-500/10 ring-4 ring-indigo-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <Search
            className={`absolute left-3.5 sm:left-4 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-colors duration-200 ${
              isFocused ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              } else if (e.key === 'Escape') {
                setIsFocused(false);
              }
            }}
            placeholder="Search train (12951, Rajdhani) or station (NDLS, Delhi)..."
            autoFocus={autoFocus}
            className="w-full bg-transparent py-3.5 sm:py-4 pl-10 sm:pl-12 pr-24 sm:pr-28 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none font-medium"
          />

          {/* Right Controls: Clear & Action Button */}
          <div className="absolute right-2 sm:right-2.5 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setTrainResults([]);
                  setStationResults([]);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={!query.trim()}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
              title="Track live or search"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
              <span className="hidden xs:inline">Track</span>
            </button>
          </div>
        </div>
      </form>

      {/* Results Dropdown — onMouseDown prevents input blur from canceling clicks */}
      {showDropdown && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute top-full left-0 right-0 z-50 mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl overflow-hidden max-h-[65vh] overflow-y-auto"
        >
          {/* Direct 4-5 digit train quick shortcut */}
          {isDirectNumber && (
            <div
              onClick={() => handleSubmit()}
              className="mb-2 p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/70 dark:to-violet-950/70 border border-indigo-200 dark:border-indigo-800/60 cursor-pointer flex items-center justify-between group hover:border-indigo-400 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-black text-xs">
                  {query.trim()}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-200">
                    Track Train {query.trim()} Live Telemetry
                  </div>
                  <div className="text-[11px] text-indigo-600 dark:text-indigo-400">
                    Press Enter or tap to track live GPS position & halts
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </div>
          )}

          {/* Trains Section */}
          {trainResults.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                <span>Trains</span>
                <span>{trainResults.length} match{trainResults.length !== 1 ? 'es' : ''}</span>
              </div>
              {trainResults.map((train, idx) => (
                <div
                  key={`${train.id}-${idx}`}
                  onClick={() => handleSelectTrain(train)}
                  className="flex items-center gap-3 sm:gap-3.5 rounded-xl p-2.5 sm:p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
                >
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 transition-colors flex-shrink-0">
                    <Train className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {train.number}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {train.name}
                      </span>
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                      {train.originName} → {train.destinationName}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[11px] sm:text-xs font-mono text-slate-400 dark:text-slate-500">
                      {Math.round(train.totalDistanceKm).toLocaleString('en-IN')} km
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">
                      {train.durationHours}h
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stations Section */}
          {stationResults.length > 0 && (
            <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <div className="px-3 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                <span>Stations (Live Boards)</span>
                <span>{stationResults.length} found</span>
              </div>
              {stationResults.slice(0, 5).map((stn, idx) => (
                <div
                  key={`${stn.code}-${idx}`}
                  onClick={() => handleSelectStation(stn.code)}
                  className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/60 transition-colors flex-shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/60">
                        {stn.code}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {stn.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {stn.city} · View Live Departure Board
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && trainResults.length === 0 && stationResults.length === 0 && !isDirectNumber && (
            <div className="px-4 py-6 text-center">
              <div className="text-2xl mb-2">🔍</div>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                No results found for &quot;{query}&quot;
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1">
                Try a 5-digit train number (12951), train name (&quot;Rajdhani&quot;), or station (&quot;NDLS&quot;)
              </p>
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="mt-3 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-100 transition-colors"
              >
                Search &quot;{query}&quot; in Journey Planner →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
