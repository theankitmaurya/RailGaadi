'use client';

import React, { useState, useEffect } from 'react';
import { DelayPrediction } from '@/types';
import { Sparkles, TrendingDown, TrendingUp, Minus, ShieldCheck, AlertCircle } from 'lucide-react';

interface DelayPredictionCardProps {
  trainNumber: string;
}

export function DelayPredictionCard({ trainNumber }: DelayPredictionCardProps) {
  const [prediction, setPrediction] = useState<DelayPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`/api/ml/predict?trainId=${trainNumber}`);
        const json = await res.json();
        if (mounted && json.success && json.data) {
          setPrediction(json.data);
        }
      } catch (err) {
        console.warn('Prediction load warning:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [trainNumber]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-5 animate-pulse">
        <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded-md mb-4" />
        <div className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
      </div>
    );
  }

  if (!prediction) return null;

  return (
    <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/40 via-white to-violet-50/30 dark:from-indigo-950/20 dark:via-slate-900/80 dark:to-violet-950/20 p-5 sm:p-6 shadow-xs relative overflow-hidden backdrop-blur-md">
      {/* Top row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              AI Delay Forecast
            </h3>
            <span className="text-[10px] text-slate-400">Destination ETA Predictor</span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800 px-2 py-0.5 rounded-full">
          <ShieldCheck className="w-3 h-3" />
          {prediction.confidencePercent}% Confidence
        </span>
      </div>

      {/* Metric comparison */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-800">
          <div className="text-[11px] font-medium text-slate-500">Current Delay</div>
          <div className="text-lg sm:text-xl font-mono font-black text-slate-800 dark:text-slate-200 mt-0.5">
            {prediction.currentDelayMinutes > 0 ? `+${prediction.currentDelayMinutes}m` : 'On Time'}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-800">
          <div className="text-[11px] font-medium text-slate-500">Predicted Arrival</div>
          <div className="text-lg sm:text-xl font-mono font-black text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center gap-1.5">
            <span>{prediction.predictedDelayMinutes > 0 ? `+${prediction.predictedDelayMinutes}m` : 'On Time'}</span>
            {prediction.trend === 'DECREASING' ? (
              <TrendingDown className="w-4 h-4 text-emerald-500" />
            ) : prediction.trend === 'INCREASING' ? (
              <TrendingUp className="w-4 h-4 text-rose-500" />
            ) : (
              <Minus className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>
      </div>

      {/* AI Reasoning note */}
      {prediction.reasoning && (
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white/60 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
          {prediction.reasoning}
        </p>
      )}

      <div className="mt-3 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Model: XGBoost / Telemetry Engine</span>
        <span>Estimated by RailGaadi AI</span>
      </div>
    </div>
  );
}
