'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { SearchCommand } from '@/components/search/SearchCommand';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  TrainTrack,
  Search,
  Sun,
  Moon,
  Compass,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, profile } = useAuth();

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
            ? 'bg-white/85 dark:bg-[#090c15]/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/80 shadow-xs'
            : 'bg-white/60 dark:bg-[#090c15]/60 backdrop-blur-md border-b border-transparent'
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
                <div className="text-sm sm:text-[15px] font-bold tracking-tight leading-tight text-slate-900 dark:text-slate-100">
                  RailGaadi
                </div>
                <div className="text-[9px] sm:text-[10px] font-medium text-slate-400 dark:text-slate-500 leading-none tracking-wide hidden xs:block">
                  RAILWAY INTELLIGENCE
                </div>
              </div>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/planner"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
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
              className="group flex items-center gap-2 sm:gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2 sm:px-3.5 sm:py-2 text-sm text-slate-400 dark:text-slate-400 transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-500/60 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:shadow-indigo-500/10 cursor-pointer"
            >
              <Search className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
              <span className="hidden sm:inline text-xs sm:text-sm text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                Search trains...
              </span>
              <kbd className="hidden md:inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-0.5 text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 shadow-xs">
                ⌘K
              </kbd>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-amber-300 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-amber-500/40 hover:text-indigo-600 dark:hover:text-amber-300 cursor-pointer transition-all duration-200"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Profile / Auth Button */}
            {user ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all group"
              >
                <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold font-mono">
                  {profile?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline max-w-[80px] truncate">
                  {profile?.name || user.email?.split('@')[0]}
                </span>
              </Link>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-900/60 hover:bg-indigo-600 hover:text-white transition-all duration-200 cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <SearchCommand isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
