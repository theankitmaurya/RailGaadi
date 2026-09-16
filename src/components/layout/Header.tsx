'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { SearchCommand } from '@/components/search/SearchCommand';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import {
  TrainTrack,
  Search,
  Compass,
  User as UserIcon,
  Star,
} from 'lucide-react';

export function Header() {
  const { isSignedIn, isLoaded } = useUser();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-xs'
            : 'bg-white/60 backdrop-blur-md border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-[58px] sm:h-[62px] max-w-[1280px] items-center justify-between px-3.5 sm:px-6 lg:px-10">
          {/* Left: Logo & Nav Links */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group select-none">
              <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md group-hover:shadow-indigo-500/40 transition-all duration-200">
                <TrainTrack className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              </div>
              <div>
                <div className="text-sm sm:text-[15px] font-bold tracking-tight leading-tight text-slate-900">
                  RailGaadi
                </div>
                <div className="text-[9px] sm:text-[10px] font-medium text-slate-400 leading-none tracking-wide hidden xs:block">
                  RAILWAY INTELLIGENCE
                </div>
              </div>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/planner"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Planner</span>
              </Link>
            </nav>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search trains"
              className="group flex items-center gap-2 sm:gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 sm:px-3.5 sm:py-2 text-sm text-slate-400 transition-all duration-200 hover:border-indigo-300 hover:bg-white hover:shadow-md hover:shadow-indigo-500/10 cursor-pointer"
            >
              <Search className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span className="hidden sm:inline text-xs sm:text-sm text-slate-400 group-hover:text-slate-600 transition-colors">
                Search trains...
              </span>
              <kbd className="hidden md:inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-mono font-medium text-slate-400 shadow-xs">
                ?K
              </kbd>
            </button>

            {/* Clerk Authentication: Sign In Modal & User Button */}
            {!isLoaded ? (
              <div className="w-8 h-8 rounded-xl bg-slate-100 animate-pulse" />
            ) : isSignedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  title="View Saved Journeys"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span className="hidden sm:inline">Saved</span>
                </Link>
                <UserButton />
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200/80 hover:bg-indigo-600 hover:text-white transition-all duration-200 cursor-pointer">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Sign In</span>
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      <SearchCommand isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}