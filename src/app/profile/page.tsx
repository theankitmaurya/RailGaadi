'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useFavourites } from '@/hooks/useFavourites';
import { AuthModal } from '@/components/auth/AuthModal';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  User,
  Star,
  Building2,
  TrainTrack,
  ArrowRight,
  LogOut,
  Sparkles,
  Calendar,
  Compass,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, signOut, isLoading } = useAuth();
  const { favouriteTrains, favouriteStations } = useFavourites();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'trains' | 'stations' | 'journeys'>('trains');

  if (isLoading) {
    return (
      <main className="min-h-[85vh] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500">Loading your profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-20 bg-slate-50/50 dark:bg-[#090c15]">
      {/* Hero Header */}
      <div className="relative border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-500/25">
                <User className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {profile?.name || user?.email?.split('@')[0] || 'Guest Traveler'}
                  </h1>
                  {profile?.role === 'admin' && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {user?.email || 'Save your favourite trains and stations across all your devices.'}
                </p>
              </div>
            </div>

            {user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="self-start sm:self-center text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/50"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign Out
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAuthOpen(true)}
                className="self-start sm:self-center text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Sign In / Create Account
              </Button>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-8">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {favouriteTrains.length}
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                Saved Trains
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-2xl font-black text-amber-500 dark:text-amber-400 font-mono">
                {favouriteStations.length}
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                Saved Stations
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-2xl font-black text-emerald-500 dark:text-emerald-400 font-mono">
                Active
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                Cloud Sync Status
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('trains')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'trains'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrainTrack className="w-4 h-4" />
            <span>Saved Trains ({favouriteTrains.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('stations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'stations'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Saved Stations ({favouriteStations.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('journeys')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'journeys'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>My Journeys</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'trains' && (
          <div>
            {favouriteTrains.length === 0 ? (
              <Card className="p-8 text-center">
                <Star className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No Saved Trains Yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Click the star icon on any train card or journey page to save it here for fast 1-click live status updates.
                </p>
                <Link href="/" className="inline-block mt-4">
                  <Button size="sm" variant="outline" className="text-xs">
                    Explore Trains <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {favouriteTrains.map((num) => (
                  <Link
                    key={num}
                    href={`/journey/${num}`}
                    className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs">
                        {num}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          Train {num}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">Live Tracking</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stations' && (
          <div>
            {favouriteStations.length === 0 ? (
              <Card className="p-8 text-center">
                <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No Saved Stations
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Save stations like NDLS, MMCT, LKO to check live departure boards and plan connecting trips.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {favouriteStations.map((code) => (
                  <Link
                    key={code}
                    href={`/planner?from=${code}`}
                    className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-amber-400 dark:hover:border-amber-500 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs">
                        {code}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                          Station {code}
                        </div>
                        <div className="text-[11px] text-slate-400">Departure Board & Planner</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'journeys' && (
          <Card className="p-8 text-center">
            <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Journey Planner
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Plan and save train itineraries between any two stations with AI reliability scoring.
            </p>
            <Link href="/planner" className="inline-block mt-4">
              <Button size="sm" variant="primary" className="text-xs">
                Launch Journey Planner <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </Card>
        )}
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </main>
  );
}
