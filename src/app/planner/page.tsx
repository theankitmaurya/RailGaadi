'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Check,
  Train as TrainIcon,
  MapPin,
  Filter,
  X,
  AlertCircle,
  Award,
} from 'lucide-react';

interface StationSuggestion {
  code: string;
  name: string;
  city: string;
}

const POPULAR_ROUTES = [
  { from: 'NDLS', to: 'AGC', label: 'Delhi → Agra' },
  { from: 'NDLS', to: 'MMCT', label: 'Delhi → Mumbai' },
  { from: 'NDLS', to: 'LKO', label: 'Delhi → Lucknow' },
  { from: 'NDLS', to: 'BSB', label: 'Delhi → Varanasi' },
  { from: 'MMCT', to: 'ADI', label: 'Mumbai → Ahmedabad' },
  { from: 'NDLS', to: 'CNB', label: 'Delhi → Kanpur' },
  { from: 'SBC', to: 'MAS', label: 'Bengaluru → Chennai' },
  { from: 'PNBE', to: 'NDLS', label: 'Patna → Delhi' },
];

const DAYS_MAP = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
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

  // Mode: 'route' (Station to Station) or 'train' (Search by Train Number/Name)
  const [searchMode, setSearchMode] = useState<'route' | 'train'>('route');

  // Route fields
  const [fromCode, setFromCode] = useState(searchParams.get('from') || 'NDLS');
  const [toCode, setToCode] = useState(searchParams.get('to') || 'AGC');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [allDays, setAllDays] = useState(false);

  // Train Direct search field
  const [trainQuery, setTrainQuery] = useState(searchParams.get('train') || '');

  // Preferences & In-page filter
  const [preference, setPreference] = useState<'reliable' | 'fastest' | 'lowest_delay' | 'earliest'>('reliable');
  const [filterText, setFilterText] = useState('');

  // Results & Loading
  const [results, setResults] = useState<PlannerOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Autocomplete state for From & To
  const [fromSuggestions, setFromSuggestions] = useState<StationSuggestion[]>([]);
  const [toSuggestions, setToSuggestions] = useState<StationSuggestion[]>([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const fromWrapperRef = useRef<HTMLDivElement>(null);
  const toWrapperRef = useRef<HTMLDivElement>(null);

  // Handle click outside dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fromWrapperRef.current && !fromWrapperRef.current.contains(event.target as Node)) {
        setShowFromDropdown(false);
      }
      if (toWrapperRef.current && !toWrapperRef.current.contains(event.target as Node)) {
        setShowToDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Station autocomplete query debouncer for From
  useEffect(() => {
    if (!fromCode || fromCode.trim().length < 2) {
      setFromSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stations/search?q=${encodeURIComponent(fromCode.trim())}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setFromSuggestions(json.data);
        }
      } catch {
        setFromSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [fromCode]);

  // Station autocomplete query debouncer for To
  useEffect(() => {
    if (!toCode || toCode.trim().length < 2) {
      setToSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stations/search?q=${encodeURIComponent(toCode.trim())}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setToSuggestions(json.data);
        }
      } catch {
        setToSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [toCode]);

  // Fetch route trains or train direct
  const fetchTrains = useCallback(
    async (overrideFrom?: string, overrideTo?: string, overrideTrain?: string) => {
      setIsLoading(true);
      setHasSearched(true);

      try {
        let url = '';
        if (searchMode === 'train' || overrideTrain) {
          const q = (overrideTrain || trainQuery).trim();
          if (!q) {
            setIsLoading(false);
            return;
          }
          url = `/api/journeys/plan?train=${encodeURIComponent(q)}&preference=${preference}`;
        } else {
          const f = (overrideFrom || fromCode).trim();
          const t = (overrideTo || toCode).trim();
          if (!f || !t) {
            setIsLoading(false);
            return;
          }
          const dateParam = allDays ? '' : `&date=${date}`;
          url = `/api/journeys/plan?from=${encodeURIComponent(f)}&to=${encodeURIComponent(t)}${dateParam}&preference=${preference}`;
        }

        const res = await fetch(url);
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
    },
    [searchMode, trainQuery, fromCode, toCode, date, allDays, preference]
  );

  // Initial load
  useEffect(() => {
    fetchTrains();
  }, [fetchTrains]);

  const handleSwap = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
    setShowFromDropdown(false);
    setShowToDropdown(false);
    fetchTrains(toCode, temp);
  };

  const handleQuickRoute = (from: string, to: string) => {
    setSearchMode('route');
    setFromCode(from);
    setToCode(to);
    setShowFromDropdown(false);
    setShowToDropdown(false);
    fetchTrains(from, to);
  };

  // Filter results by in-page filterText
  const filteredResults = results.filter((train) => {
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase();
    return (
      train.trainNumber.toLowerCase().includes(q) ||
      train.trainName.toLowerCase().includes(q) ||
      (train.trainType && train.trainType.toLowerCase().includes(q))
    );
  });

  // Top AI Picks
  const bestReliable = results.length > 0 ? results[0] : null;
  const fastestTrain =
    results.length > 0
      ? [...results].sort((a, b) => a.durationHours - b.durationHours)[0]
      : null;

  return (
    <main className="min-h-screen pb-20 bg-slate-50/50 dark:bg-[#090c15] text-slate-900 dark:text-slate-100">
      {/* Hero Header */}
      <div className="relative border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/30">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  AI Journey Planner
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    Live Telemetry
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Search scheduled trains between any Indian Railways stations or lookup any train directly.
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setSearchMode('route');
                  fetchTrains();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  searchMode === 'route'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                By Stations
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMode('train');
                  if (trainQuery) fetchTrains(undefined, undefined, trainQuery);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  searchMode === 'train'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <TrainIcon className="w-3.5 h-3.5" />
                By Train Number/Name
              </button>
            </div>
          </div>

          {/* Search Form Card */}
          <div className="mt-4 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
            {searchMode === 'route' ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  {/* From Station with Dropdown */}
                  <div className="md:col-span-4 relative" ref={fromWrapperRef}>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Origin Station / City
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. NDLS or Delhi"
                        value={fromCode}
                        onChange={(e) => {
                          setFromCode(e.target.value);
                          setShowFromDropdown(true);
                        }}
                        onFocus={() => setShowFromDropdown(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (fromSuggestions.length > 0) {
                              const code = fromSuggestions[0].code;
                              setFromCode(code);
                              setShowFromDropdown(false);
                              if (toCode) fetchTrains(code, toCode);
                            } else {
                              fetchTrains();
                            }
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 uppercase"
                      />
                      {fromCode && (
                        <button
                          type="button"
                          onClick={() => setFromCode('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* From Dropdown Suggestions */}
                    {showFromDropdown && fromSuggestions.length > 0 && (
                      <div
                        onMouseDown={(e) => e.preventDefault()}
                        className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800"
                      >
                        {fromSuggestions.map((stn) => (
                          <div
                            key={stn.code}
                            onClick={() => {
                              setFromCode(stn.code);
                              setShowFromDropdown(false);
                              if (toCode) fetchTrains(stn.code, toCode);
                            }}
                            className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                                {stn.code}
                              </span>
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                {stn.name}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">{stn.city}</span>
                          </div>
                        ))}
                      </div>
                    )}
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

                  {/* To Station with Dropdown */}
                  <div className="md:col-span-4 relative" ref={toWrapperRef}>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Destination Station / City
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. AGC or Agra"
                        value={toCode}
                        onChange={(e) => {
                          setToCode(e.target.value);
                          setShowToDropdown(true);
                        }}
                        onFocus={() => setShowToDropdown(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (toSuggestions.length > 0) {
                              const code = toSuggestions[0].code;
                              setToCode(code);
                              setShowToDropdown(false);
                              if (fromCode) fetchTrains(fromCode, code);
                            } else {
                              fetchTrains();
                            }
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 uppercase"
                      />
                      {toCode && (
                        <button
                          type="button"
                          onClick={() => setToCode('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* To Dropdown Suggestions */}
                    {showToDropdown && toSuggestions.length > 0 && (
                      <div
                        onMouseDown={(e) => e.preventDefault()}
                        className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800"
                      >
                        {toSuggestions.map((stn) => (
                          <div
                            key={stn.code}
                            onClick={() => {
                              setToCode(stn.code);
                              setShowToDropdown(false);
                              if (fromCode) fetchTrains(fromCode, stn.code);
                            }}
                            className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                                {stn.code}
                              </span>
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                {stn.name}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">{stn.city}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Search Submit */}
                  <div className="md:col-span-3">
                    <Button
                      onClick={() => fetchTrains()}
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

                {/* Date & All Days Row */}
                <div className="mt-3 flex items-center gap-4 flex-wrap text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Travel Date:</span>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={allDays}
                      className={`px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-mono font-semibold ${
                        allDays ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allDays}
                      onChange={(e) => setAllDays(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Show all scheduled trains on route (Any day)
                    </span>
                  </label>
                </div>

                {/* Popular Route Chips */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-400">Popular Routes:</span>
                  {POPULAR_ROUTES.map((route) => (
                    <button
                      key={`${route.from}-${route.to}`}
                      onClick={() => handleQuickRoute(route.from, route.to)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        fromCode.toUpperCase() === route.from && toCode.toUpperCase() === route.to
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {route.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Search By Train Direct */
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Train Number or Train Name
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="e.g. 12951, 22436, Vande Bharat, Rajdhani, Shatabdi"
                      value={trainQuery}
                      onChange={(e) => setTrainQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') fetchTrains(undefined, undefined, trainQuery);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    {trainQuery && (
                      <button
                        type="button"
                        onClick={() => setTrainQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <Button
                    onClick={() => fetchTrains(undefined, undefined, trainQuery)}
                    disabled={isLoading || !trainQuery.trim()}
                    className="px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>Search Train</span>
                  </Button>
                </div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-400">Quick Examples:</span>
                  {['12951', '22436', '12002', '12301', 'Vande Bharat'].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => {
                        setTrainQuery(ex);
                        fetchTrains(undefined, undefined, ex);
                      }}
                      className="text-xs px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-400 cursor-pointer"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Container */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Preference Tabs & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{searchMode === 'train' ? 'Train Matches' : 'Available Trains'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-600 dark:text-slate-400">
                {filteredResults.length} {filteredResults.length === 1 ? 'train' : 'trains'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Ranked dynamically by travel duration, historical punctuality, and telemetry delay risk.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* In-page text filter */}
            {results.length > 2 && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter results..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="px-3 py-1.5 pl-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-36 sm:w-44"
                />
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                {filterText && (
                  <button
                    type="button"
                    onClick={() => setFilterText('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Sorting Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
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
        </div>

        {/* AI Route Intelligence Card (When results are available) */}
        {!isLoading && results.length > 0 && bestReliable && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-blue-950/40 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-200">
                    AI Journey Intelligence
                  </h3>
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold px-2 py-0.5 rounded-full">
                    Route Analysis
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                      🌟 Top Recommended Train
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {bestReliable.trainName} ({bestReliable.trainNumber})
                    </span>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      {bestReliable.reliabilityScore}% reliability score
                    </div>
                  </div>

                  {fastestTrain && (
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                        ⚡ Fastest Option
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {fastestTrain.trainName}
                      </span>
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                        Duration: {fastestTrain.durationText}
                      </div>
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900 sm:col-span-2 md:col-span-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                      🛡️ Punctuality Tip
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      Choose morning departures before 09:00 for the lowest secondary delay risk on this corridor.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredResults.length === 0 ? (
          <Card className="p-12 text-center">
            <Compass className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {hasSearched ? 'No Direct Trains Found' : 'Search Trains'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              {hasSearched
                ? filterText
                  ? `No trains matching "${filterText}". Try clearing your filter.`
                  : searchMode === 'train'
                  ? `No train found matching "${trainQuery}". Please verify the train number or name.`
                  : `No direct scheduled trains found between "${fromCode}" and "${toCode}". Try checking nearby junction stations or tick "Show all scheduled trains".`
                : 'Enter origin and destination station codes or search by train number above to view all scheduled trains.'}
            </p>
            {hasSearched && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterText('');
                  setAllDays(true);
                  fetchTrains();
                }}
                className="mt-4 text-xs cursor-pointer"
              >
                Reset Filters & Search All Days
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredResults.map((train, idx) => {
              const isBest = idx === 0 && !filterText;
              const runDays = Array.isArray(train.runsOnDays) ? train.runsOnDays : [];
              const isDaily = runDays.length >= 7;

              return (
                <div
                  key={`${train.trainNumber}-${train.fromStation.code}-${idx}`}
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
                          <Award className="w-3 h-3" /> BEST OPTION
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
                        {train.delayRisk === 'LOW'
                          ? 'Low Delay Risk'
                          : train.delayRisk === 'MEDIUM'
                          ? 'Moderate Risk'
                          : 'High Delay Risk'}
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
                        Distance: {Math.round(train.distanceKm)} km · {train.fromStation.name} → {train.toStation.name}
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

                  {/* Bottom Action Row with Dynamic Running Days */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
                    {/* Days of Operation Badges */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-medium">Runs:</span>
                      <div className="flex items-center gap-1">
                        {DAYS_MAP.map((d) => {
                          const isActive =
                            isDaily ||
                            runDays.some(
                              (rd) =>
                                rd.toLowerCase() === d.key ||
                                rd.toLowerCase().startsWith(d.key)
                            );
                          return (
                            <span
                              key={d.key}
                              title={`${d.key.toUpperCase()}: ${isActive ? 'Runs' : 'Does not run'}`}
                              className={`w-5 h-5 flex items-center justify-center rounded-md text-[10px] font-mono font-bold transition-colors ${
                                isActive
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                              }`}
                            >
                              {d.label}
                            </span>
                          );
                        })}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 ml-1">
                        {isDaily
                          ? 'Daily'
                          : runDays.map((d) => d.slice(0, 3).toUpperCase()).join(', ')}
                      </span>
                    </div>

                    {/* Actions */}
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

