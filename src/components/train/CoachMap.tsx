'use client';

import React, { useState } from 'react';
import { TrainTrack, Info } from 'lucide-react';

interface CoachMapProps {
  trainNumber: string;
  coachPositionStr?: string;
}

interface CoachItem {
  id: string;
  name: string;
  type: 'ENG' | '1A' | '2A' | '3A' | '3E' | 'CC' | 'SL' | 'GS' | 'GEN' | 'SLR' | 'EOG';
  label: string;
  description: string;
}

export function CoachMap({ trainNumber, coachPositionStr }: CoachMapProps) {
  const [selectedCoach, setSelectedCoach] = useState<CoachItem | null>(null);

  // Generate coaches from string or default standard rake
  const rawCodes = coachPositionStr
    ? coachPositionStr.split('-').filter(Boolean)
    : ['ENG', 'SLR', 'GS', 'A1', 'B1', 'B2', 'B3', 'B4', 'B5', 'S1', 'S2', 'S3', 'S4', 'S5', 'GS', 'SLR'];

  const coaches: CoachItem[] = rawCodes.map((code, idx) => {
    const upper = code.toUpperCase();
    let type: CoachItem['type'] = 'GEN';
    let label = 'General / Unreserved';
    let description = 'General unreserved seating with open accommodation.';

    if (upper.includes('ENG') || upper.includes('LOCO')) {
      type = 'ENG';
      label = 'Locomotive Engine';
      description = 'Electric / Diesel Locomotive (WAP-7 / WAP-5).';
    } else if (upper.startsWith('H') || upper === '1A' || upper === 'EC' || upper === 'EA') {
      type = '1A';
      label = 'AC First Class / Executive';
      description = 'Premium 2-berth and 4-berth lockable coupés with bedding & full privacy.';
    } else if (upper.startsWith('A') || upper === '2A') {
      type = '2A';
      label = 'AC 2-Tier';
      description = 'Spacious 2-tier air-conditioned berths with personal curtains & reading lamps.';
    } else if (upper.startsWith('B') || upper === '3A') {
      type = '3A';
      label = 'AC 3-Tier';
      description = '64-72 berths AC accommodation with linen, blankets, and power sockets.';
    } else if (upper.startsWith('M') || upper === '3E') {
      type = '3E';
      label = 'AC 3-Tier Economy';
      description = 'Modern 83-berth high-capacity economy AC with individual AC vents.';
    } else if (upper.startsWith('C') || upper === 'CC') {
      type = 'CC';
      label = 'AC Chair Car';
      description = 'Comfortable 3x2 pushback seating with wide tinted glass windows.';
    } else if (upper.startsWith('S') && !upper.startsWith('SLR')) {
      type = 'SL';
      label = 'Sleeper Class';
      description = 'Standard 3-tier non-AC sleeping coach with open windows.';
    } else if (upper.includes('SLR') || upper.includes('EOG') || upper.includes('DL')) {
      type = 'SLR';
      label = 'Luggage & Brake Van';
      description = 'Guard cabin, parcel space, and divyangjan accessible compartment.';
    }

    return {
      id: `${upper}-${idx}`,
      name: upper,
      type,
      label,
      description,
    };
  });

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <TrainTrack className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              Rake & Coach Position
            </h3>
            <span className="text-[10px] text-slate-400">Tap any coach to view berth amenities</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">
          {coaches.length} Coaches
        </span>
      </div>

      {/* Horizontal Coach Stream */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 pt-1 no-scrollbar select-none">
        {coaches.map((c, i) => {
          const isSelected = selectedCoach?.id === c.id;
          const isEngine = c.type === 'ENG';

          return (
            <button
              key={c.id}
              onClick={() => setSelectedCoach(c)}
              className={`flex-shrink-0 flex flex-col items-center justify-between h-14 w-12 sm:w-14 rounded-xl border font-mono transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/30'
                  : isEngine
                  ? 'border-amber-400/80 bg-amber-500 text-white dark:text-slate-950 font-black'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              <span className="text-[9px] text-slate-400 dark:text-slate-500 pt-1 font-sans font-semibold">
                #{i + 1}
              </span>
              <span className="text-xs font-black pb-1.5">{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Coach Inspector */}
      {selectedCoach && (
        <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Coach {selectedCoach.name}</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {selectedCoach.label}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {selectedCoach.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
