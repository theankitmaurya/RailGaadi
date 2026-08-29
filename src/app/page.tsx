'use client';

import React from 'react';
import { SearchInput } from '@/components/search/SearchInput';
import { RecentSearches } from '@/components/search/RecentSearches';
import { FavouriteTrains } from '@/components/search/FavouriteTrains';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Train } from '@/types';
import { MOCK_TRAINS } from '@/providers/mock/trainData';
import Link from 'next/link';
import { ArrowRight, Zap, MapPin, TrendingUp, Wifi, Star } from 'lucide-react';

const STATS = [
  { label: 'Live Trains', value: '8,000+', icon: Zap },
  { label: 'Stations', value: '7,325', icon: MapPin },
  { label: 'Routes', value: '1,200+', icon: TrendingUp },
];

export default function HomePage() {
  const [recents, setRecents] = useLocalStorage<Train[]>('rg_recent_searches', [MOCK_TRAINS[0], MOCK_TRAINS[1]]);
  const [favourites, setFavourites] = useLocalStorage<Train[]>('rg_favourite_trains', []);

  const handleSelectTrain = (train: Train) => {
    setRecents((prev) => {
      const filtered = prev.filter((t) => t.id !== train.id);
      return [train, ...filtered].slice(0, 6);
    });
  };

  const handleToggleFavourite = (train: Train) => {
    setFavourites((prev) => {
      const exists = prev.some((f) => f.id === train.id);
      return exists ? prev.filter((f) => f.id !== train.id) : [train, ...prev];
    });
  };

  const handleClearRecents = () => setRecents([]);
  const handleRemoveRecent = (trainId: string) => setRecents((prev) => prev.filter((t) => t.id !== trainId));
  const handleRemoveFavourite = (trainId: string) => setFavourites((prev) => prev.filter((f) => f.id !== trainId));

  return (
    <div className="relative min-h-[calc(100vh-62px)] overflow-hidden bg-slate-50 dark:bg-[#090c15] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-64 left-1/2 -translate-x-1/2 h-[480px] sm:h-[640px] w-[600px] sm:w-[900px] rounded-full blur-[100px] sm:blur-[120px] bg-indigo-100/60 dark:bg-indigo-950/50" />
        <div className="absolute top-1/3 -left-32 h-[300px] sm:h-[400px] w-[300px] sm:w-[400px] rounded-full blur-[70px] sm:blur-[80px] bg-violet-100/40 dark:bg-violet-950/30" />
        <div className="absolute top-1/4 -right-32 h-[240px] sm:h-[300px] w-[240px] sm:w-[300px] rounded-full blur-[50px] sm:blur-[60px] bg-sky-100/40 dark:bg-sky-950/20" />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-3.5 sm:px-6 lg:px-10 pt-8 sm:pt-16 pb-16 sm:pb-24">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 dark:border-indigo-800/60 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/80 dark:to-violet-950/80 px-3 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm mb-6 sm:mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            Real-time Railway Intelligence for India
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] mb-4 sm:mb-5">
            <span className="text-slate-900 dark:text-slate-100">Track your journey.</span>
            <br />
            <span className="gradient-text">Understand every mile.</span>
          </h1>

          {/* Subtext */}
          <p className="text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 text-slate-500 dark:text-slate-400 px-2">
            Immersive train tracking, live route mapping, delay analytics, elevation profiles, and smart geographic companion for Indian Railways.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-8 sm:mb-10">
            <SearchInput onSelectTrain={handleSelectTrain} autoFocus />
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm flex-wrap">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                <Icon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                <span className="font-bold text-slate-700 dark:text-slate-200">{value}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recents & Favourites */}
        {(recents.length > 0 || favourites.length > 0) && (
          <div className="mt-12 sm:mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <RecentSearches recents={recents} onClear={handleClearRecents} onRemove={handleRemoveRecent} />
            <FavouriteTrains favourites={favourites} onRemove={handleRemoveFavourite} />
          </div>
        )}

        {/* Featured Trains Grid */}
        <div className="mt-12 sm:mt-20">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Flagship Trains
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-0.5">India&apos;s most iconic railway services — tap to track live</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full flex-shrink-0">
              <Wifi className="w-3 h-3" />
              <span className="hidden xs:inline">Live Status</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {MOCK_TRAINS.map((train) => {
              const isFav = favourites.some((f) => f.id === train.id);
              return (
                <div
                  key={train.id}
                  className="group card-premium p-4 sm:p-5 flex flex-col justify-between min-h-[140px] sm:min-h-[148px] bg-white dark:bg-[#0f1117] border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-indigo-500/40"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center font-mono text-xs sm:text-[13px] font-black px-2.5 py-0.5 rounded-lg transition-colors duration-200 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                      {train.number}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {/* Favourite toggle */}
                      <button
                        onClick={() => handleToggleFavourite(train)}
                        className={`p-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                          isFav
                            ? 'text-amber-400 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                            : 'text-slate-300 dark:text-slate-600 hover:text-amber-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                        }`}
                        title={isFav ? 'Remove from saved' : 'Save train'}
                      >
                        <Star className={`w-4 h-4 transition-transform ${isFav ? 'fill-amber-400 scale-110' : ''}`} />
                      </button>
                      <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                      </span>
                    </div>
                  </div>

                  {/* Train name */}
                  <Link href={`/journey/${train.id}`} onClick={() => handleSelectTrain(train)} className="mt-2.5 sm:mt-3 block">
                    <h3 className="text-sm sm:text-[15px] font-bold transition-colors duration-200 leading-snug text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {train.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-1 truncate">
                      {train.originName} → {train.destinationName}
                    </p>
                  </Link>

                  {/* Bottom row */}
                  <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-slate-400 dark:text-slate-500">
                      <span className="font-mono">{train.totalDistanceKm.toLocaleString('en-IN')} km</span>
                      <span className="w-0.5 h-3 bg-slate-200 dark:bg-slate-800 rounded-full" />
                      <span>{train.durationHours}h</span>
                    </div>
                    <Link
                      href={`/journey/${train.id}`}
                      onClick={() => handleSelectTrain(train)}
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 sm:opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <span>Track</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
