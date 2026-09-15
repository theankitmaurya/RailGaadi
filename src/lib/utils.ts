import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RunningState } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDelay(delayMinutes: number): {
  text: string;
  badgeVariant: 'success' | 'warning' | 'error' | 'neutral';
  shortText: string;
} {
  if (delayMinutes <= 0) {
    const minEarly = Math.abs(delayMinutes);
    if (minEarly > 0) {
      return {
        text: `${minEarly} min early`,
        shortText: `Early ${minEarly}m`,
        badgeVariant: 'success',
      };
    }
    return {
      text: 'On Time',
      shortText: 'On Time',
      badgeVariant: 'success',
    };
  }

  if (delayMinutes < 15) {
    return {
      text: `Delayed by ${delayMinutes} min`,
      shortText: `+${delayMinutes}m`,
      badgeVariant: 'warning',
    };
  }

  return {
    text: `Delayed by ${delayMinutes} min`,
    shortText: `+${delayMinutes}m`,
    badgeVariant: 'error',
  };
}

export function getRunningStateInfo(state: RunningState, delayMinutes: number = 0) {
  switch (state) {
    case 'ON_TIME':
      return { label: 'On Time', colorClass: 'bg-emerald-500 text-white', textClass: 'text-emerald-600' };
    case 'DELAYED':
      return { label: `Delayed · ${delayMinutes} min`, colorClass: 'bg-amber-500 text-white', textClass: 'text-amber-600' };
    case 'EARLY':
      return { label: 'Running Early', colorClass: 'bg-teal-500 text-white', textClass: 'text-teal-600' };
    case 'NOT_STARTED':
      return { label: 'Not Started', colorClass: 'bg-slate-400 text-white', textClass: 'text-slate-500' };
    case 'COMPLETED':
      return { label: 'Journey Completed', colorClass: 'bg-blue-600 text-white', textClass: 'text-blue-600' };
    case 'DATA_UNAVAILABLE':
    case 'UNKNOWN':
    default:
      return { label: 'Status Unavailable', colorClass: 'bg-slate-500 text-white', textClass: 'text-slate-600' };
  }
}

export function formatDistance(km: number): string {
  return `${Math.round(km).toLocaleString('en-IN')} km`;
}

export function formatTime(timeStr?: string): string {
  if (!timeStr || timeStr === '--:--') return '--:--';

  // Handles HH:MM format
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  // Handles HH:MM:SS format
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeStr)) {
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  // Handles ISO date strings
  try {
    const date = new Date(timeStr);
    if (!isNaN(date.getTime())) {
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }
  } catch {
    // fallback
  }

  return timeStr;
}
