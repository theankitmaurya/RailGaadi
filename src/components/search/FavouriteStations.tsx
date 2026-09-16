'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFavourites } from '@/hooks/useFavourites';
import { Building2, Star, Trash2, Plus } from 'lucide-react';

const COMMON_STATIONS = [
  { code: 'NDLS', name: 'New Delhi' },
  { code: 'MMCT', name: 'Mumbai Central' },
  { code: 'HWH', name: 'Howrah Jn' },
  { code: 'LKO', name: 'Lucknow Charbagh' },
  { code: 'CNB', name: 'Kanpur Central' },
  { code: 'BPL', name: 'Bhopal Jn' },
];

export function FavouriteStations() {
  const { favouriteStations, toggleFavouriteStation } = useFavourites();
  const [showAdd, setShowAdd] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    toggleFavouriteStation(newCode.trim().toUpperCase(), newName.trim() || newCode.trim().toUpperCase());
    setNewCode('');
    setNewName('');
    setShowAdd(false);
  };

  if (!favouriteStations.length && !showAdd) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 sm:p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">
              Saved Stations
            </h3>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Station
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Quickly save your regular boarding and destination stations (e.g. NDLS, LKO, MMCT).
        </p>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_STATIONS.slice(0, 4).map((st) => (
            <button
              key={st.code}
              onClick={() => toggleFavouriteStation(st.code, st.name)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dashed border-slate-300 text-xs font-mono text-slate-600 hover:border-amber-400 hover:text-amber-500 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{st.code}</span>
              <span className="text-[10px] text-slate-400">({st.name})</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 sm:p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-800">
            Saved Stations
          </h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold">
            {favouriteStations.length}
          </span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> {showAdd ? 'Cancel' : 'Add Station'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex gap-2">
          <input
            type="text"
            placeholder="Code (e.g. NDLS)"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="w-28 px-2.5 py-1.5 text-xs uppercase font-mono rounded-lg border border-slate-300 bg-white text-slate-800"
            required
            maxLength={6}
          />
          <input
            type="text"
            placeholder="Station Name (optional)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
          >
            Save
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {favouriteStations.map((code) => (
          <div
            key={code}
            className="group inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-amber-400/60 transition-all duration-150"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500" />
            <Link
              href={`/planner?from=${code}`}
              className="text-xs font-bold font-mono text-slate-800 hover:text-indigo-600"
            >
              {code}
            </Link>
            <button
              onClick={() => toggleFavouriteStation(code)}
              title="Remove from saved stations"
              className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
