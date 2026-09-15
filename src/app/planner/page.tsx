'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PlannerOption } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Compass,
  ArrowRight,
  ArrowLeftRight,
  Clock,
  ShieldCheck,
  Zap,
  TrendingDown,
  Calendar,
  Sparkles,
  Wifi,
  Search,
} from 'lucide-react';

const POPULAR_ROUTES = [
  { from: 'NDLS', to: 'MMCT', label: 'Delhi → Mumbai' },
  { from: 'NDLS', to: 'AGC', label: 'Delhi → Agra' },
  { from: 'NDLS', to: 'LKO', label: 'Delhi → Lucknow' },
  { from: 'NDLS', to: 'BSB', label: 'Delhi → Varanasi' },
  { from: 'MMCT', to: 'ADI', label: 'Mumbai → Ahmedabad' },
];

export default function JourneyPlannerPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <JourneyPlannerContent />
    </React.Suspense>
  );
}

function JourneyPlannerContent() {
  const searchParams = useSearchParams();
  const [fromCode, setFromCode] = useState(searchParams.get('from') || 'NDLS');
  const [toCode, setToCode] = useState(searchParams.get('to') || 'AGC');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [preference, setPreference] = useState<'reliable' | 'fastest' | 'lowest_delay' | 'earliest'>('reliable');
  
  const [results, setResults] = useState<PlannerOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchTrains = async () => {
    if (!fromCode.trim() || !toCode.trim()) return;
    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(
        `/api/journeys/plan?from=${encodeURIComponent(fromCode.trim())}&to=${encodeURIComponent(
          toCode.trim()
        )}&date=${date}&preference=${preference}`
      );
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setResults(json.data);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Failed to plan journey:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrains();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preference]);

  const handleSwap = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  const handleQuickRoute = (from: string, to: string) => {
    setFromCode(from);
    setToCode(to);
  };

  return (
    <main className="min-h-screen pb-20 bg-slate-50/50 dark:bg-[#090c15] text-slate-900 dark:text-slate-100">
      {/* Hero Header */}
      <div className="relative border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/30">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                AI Journey Planner
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Find trains between two stations ranked by reliability score and delay risk.
              </p>
            </div>
          </div>

          {/* Search Form Card */}
          <div className="mt-6 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/* From Station */}
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Origin Station
                </label>
                <input
                  type="text"
                  placeholder="e.g. NDLS (New Delhi)"
                  value={fromCode}
                  onChange={(e) => setFromCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Swap Button */}
              <div className="md:col-span-1 flex justify-center pb-1">
                <button
                  type="button"
                  onClick={handleSwap}
                  title="Swap Origin and Destination"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              {/* To Station */}
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Destination Station
                </label>
                <input
                  type="text"
                  placeholder="e.g. AGC (Agra Cantt)"
                  value={toCode}
                  onChange={(e) => setToCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Search Submit */}
              <div className="md:col-span-3">
                <Button
                  onClick={fetchTrains}
                  disabled={isLoading}
                  className="w-full py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Find Trains</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Popular Route Chips */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400">Popular:</span>
              {POPULAR_ROUTES.map((route) => (
                <button
                  key={`${route.from}-${route.to}`}
                  onClick={() => handleQuickRoute(route.from, route.to)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    fromCode === route.from && toCode === route.to
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {route.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Container */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Preference Tabs (FR-11) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Available Trains</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400">
                {results.length} found
              </span>
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Ranked dynamically by travel duration, punctuality records, and delay confidence.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
            <button
              onClick={() => setPreference('reliable')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                preference === 'reliable'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Most Reliable
            </button>
            <button
              onClick={() => setPreference('fastest')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                preference === 'fastest'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Fastest
            </button>
            <button
              onClick={() => setPreference('lowest_delay')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                preference === 'lowest_delay'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" /> Low Delay
            </button>
            <button
              onClick={() => setPreference('earliest')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                preference === 'earliest'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Earliest
            </button>
          </div>
        </div>

        {/* Results List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <Card className="p-12 text-center">
            <Compass className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {hasSearched ? 'No Direct Trains Found' : 'Select Origin & Destination'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              {hasSearched
                ? `No scheduled direct trains found between ${fromCode} and ${toCode}. Try checking nearby junction stations.`
                : 'Enter source and destination station codes above to discover trains ranked by punctuality and travel duration.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {results.map((train, idx) => {
              const isBest = idx === 0;
              return (
                <div
                  key={train.trainNumber}
                  className={`p-5 rounded-2xl border transition-all relative ${
                    isBest
                      ? 'bg-white dark:bg-slate-900 border-indigo-400/80 dark:border-indigo-600/60 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-400/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                        {train.trainNumber}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {train.trainType || 'Express'}
                      </span>
                      {isBest && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-300/60 dark:border-amber-700/60 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3" /> BEST OPTION
                        </span>
                      )}
                    </div>

                    {/* Delay Risk Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          train.delayRisk === 'LOW'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : train.delayRisk === 'MEDIUM'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {train.delayRisk === 'LOW' ? 'Low Delay Risk' : train.delayRisk === 'MEDIUM' ? 'Moderate Risk' : 'High Delay Risk'}
                      </span>
                    </div>
                  </div>

                  {/* Middle Row: Train Name + Journey Times */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center mb-4">
                    <div className="sm:col-span-5">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {train.trainName}
                      </h3>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Distance: {train.distanceKm} km · Direct Route
                      </div>
                    </div>

                    <div className="sm:col-span-4 flex items-center gap-3">
                      <div>
                        <div className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                          {train.fromStation.departureTime}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {train.fromStation.code}
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col items-center">
                        <div className="text-[10px] font-bold text-slate-400 mb-0.5">
                          {train.durationText}
                        </div>
                        <div className="w-full h-0.5 bg-slate-200 dark:bg-slate-700 relative">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        </div>
                      </div>

                      <div>
                        <div className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                          {train.toStation.arrivalTime}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {train.toStation.code}
                        </div>
                      </div>
                    </div>

                    {/* Reliability Gauge Score (FR-08) */}
                    <div className="sm:col-span-3 flex items-center sm:justify-end gap-3">
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Reliability
                        </div>
                        <div className="text-[10px] text-slate-400">On-time Index</div>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-black text-sm text-indigo-600 dark:text-indigo-400">
                        {train.reliabilityScore}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                    <div className="text-[11px] text-slate-400">
                      Runs on: <span className="uppercase font-mono font-semibold text-slate-600 dark:text-slate-300">Daily / Mon-Sun</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/journey/${train.trainNumber}`}>
                        <Button size="sm" variant="primary" className="text-xs py-1.5 cursor-pointer">
                          <Wifi className="w-3 h-3 mr-1.5" />
                          Track Live
                        </Button>
                      </Link>
                    </div>
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
