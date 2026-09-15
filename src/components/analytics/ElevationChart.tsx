'use client';

import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { JourneyElevation } from '@/types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Mountain } from 'lucide-react';

interface ElevationChartProps {
  elevationData?: JourneyElevation;
}

export function ElevationChart({ elevationData }: ElevationChartProps) {
  if (!elevationData || !elevationData.profile.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Mountain className="w-4 h-4 text-emerald-600" />
            <span>Route Elevation Profile</span>
          </CardTitle>
        </CardHeader>
        <p className="text-xs text-slate-400 py-6 text-center">Elevation data unavailable for this route.</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Mountain className="w-4 h-4 text-emerald-600" />
          <span>Route Elevation Profile</span>
        </CardTitle>
        <span className="text-xs text-slate-400 font-mono">
          Max {elevationData.highestElevationMeters} m
        </span>
      </CardHeader>

      <div className="h-44 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={elevationData.profile} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="distanceKm" tickFormatter={(val) => `${Math.round(val)}km`} stroke="#94a3b8" fontSize={10} />
            <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `${val}m`} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs p-2 rounded-xl shadow-xl">
                      <p className="font-bold">{data.stationName || `${Math.round(data.distanceKm)} km`}</p>
                      <p className="text-emerald-400">{data.elevationMeters} m elevation</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area type="monotone" dataKey="elevationMeters" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#elevationGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
