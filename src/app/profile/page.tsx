'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser, SignOutButton, SignInButton } from '@clerk/nextjs';
import { useFavourites } from '@/hooks/useFavourites';
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
  const { user, isLoaded } = useUser();
  const { favouriteTrains, favouriteStations } = useFavourites();
  const [activeTab, setActiveTab] = useState<'trains' | 'stations' | 'journeys'>('trains');

  if (!isLoaded) {
    return (
      <main className="min-h-[85vh] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500">Loading your profile...</p>
        </div>
      </main>
    );
  }

  const displayName = user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Guest Traveler';
  const email = user?.primaryEmailAddress?.emailAddress || '';

  return (
    <main className="min-h-screen pb-20 bg-slate-50/50">
      {/* Hero Header */}
      <div className="relative border-b border-slate-200/80 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt={displayName}
                  className="h-16 w-16 rounded-2xl object-cover shadow-xl ring-2 ring-indigo-500/30"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-500/25">
                  <User className="h-8 w-8" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    {displayName}
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {email || 'Save your favourite trains and stations across all your devices.'}
                </p>
              </div>
            </div>

            {user ? (
              <SignOutButton>
                <Button
                  variant="outline"
                  size="sm"
                  className="self-start sm:self-center text-xs text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign Out
                </Button>
              </SignOutButton>
            ) : (
              <SignInButton mode="modal">
                <Button
                  variant="primary"
                  size="sm"
                  className="self-start sm:self-center text-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Sign In / Create Account
                </Button>
              </SignInButton>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-8">
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-2xl font-black text-indigo-600 font-mono">
                {favouriteTrains.length}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">
                Saved Trains
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-2xl font-black text-amber-500 font-mono">
                {favouriteStations.length}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">
                Saved Stations
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-2xl font-black text-emerald-500 font-mono">
                {user ? 'Synced' : 'Local'}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">
                Cloud Sync Status
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 border-b border-slate-200 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('trains')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'trains'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
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
                : 'text-slate-600 hover:bg-slate-100'
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
                : 'text-slate-600 hover:bg-slate-100'
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
                <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">
                  No Saved Trains Yet
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
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
                    className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-xs hover:border-indigo-400 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-mono font-bold text-xs">
                        {num}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">
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
                <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">
                  No Saved Stations
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Save stations like NDLS, MMCT, LKO to check live departure boards and plan connecting trips.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {favouriteStations.map((code) => (
                  <Link
                    key={code}
                    href={`/planner?from=${code}`}
                    className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-xs hover:border-amber-400 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-mono font-bold text-xs">
                        {code}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-amber-600">
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
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">
              Journey Planner
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
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
    </main>
  );
}
