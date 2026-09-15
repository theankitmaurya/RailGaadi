import { PlannerOption } from '@/types';
import { getCached, setCache } from '@/lib/cache';

export interface PlanQueryParams {
  from: string;
  to: string;
  date?: string;
  preference?: 'reliable' | 'fastest' | 'lowest_delay' | 'earliest';
}

export class PlannerService {
  private static apiKey = process.env.RAILRADAR_API_KEY || '';
  private static baseUrl = 'https://api.railradar.in/v1';

  static async findTrainsBetween(params: PlanQueryParams): Promise<PlannerOption[]> {
    const from = params.from.trim().toUpperCase();
    const to = params.to.trim().toUpperCase();
    const preference = params.preference || 'reliable';

    if (!from || !to) return [];

    const cacheKey = `planner:${from}:${to}:${params.date || 'any'}`;
    const cached = getCached<PlannerOption[]>(cacheKey);
    if (cached && cached.length > 0) {
      return this.sortOptions(cached, preference);
    }

    try {
      const url = `${this.baseUrl}/trains/between/${from}/${to}${params.date ? `?date=${params.date}` : ''}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'x-api-key': this.apiKey,
        },
      });

      if (!res.ok) {
        throw new Error(`RailRadar trains between error: ${res.status}`);
      }

      const json = await res.json();
      const rawTrains = Array.isArray(json.data) ? json.data : [];

      const options: PlannerOption[] = rawTrains.map((item: any) => {
        const trainNum = item.train?.number || item.trainNumber || '';
        const trainName = item.train?.name || item.trainName || `Train ${trainNum}`;
        const trainType = item.train?.type || item.type || 'Express';

        const depTime = item.from?.departure || item.departureTime || '--:--';
        const arrTime = item.to?.arrival || item.arrivalTime || '--:--';
        const durationMin = item.duration || 180;
        const durationHours = Math.round((durationMin / 60) * 10) / 10;
        const dist = Math.round(item.distance || 200);

        // Smart Reliability calculation (FR-08)
        let reliability = 78;
        const lowerType = trainType.toLowerCase();
        if (lowerType.includes('vande') || lowerType.includes('rajdhani') || lowerType.includes('shatabdi') || lowerType.includes('tejas')) {
          reliability = 92;
        } else if (lowerType.includes('superfast') || lowerType.includes('duronto') || lowerType.includes('humsafar')) {
          reliability = 86;
        } else if (lowerType.includes('mail')) {
          reliability = 76;
        } else if (lowerType.includes('passenger') || lowerType.includes('local')) {
          reliability = 64;
        }

        // Halts factor: fewer halts = better punctuality
        if ((item.totalHaltsBetween || 0) <= 2) reliability += 4;
        else if ((item.totalHaltsBetween || 0) > 10) reliability -= 6;
        reliability = Math.min(98, Math.max(50, reliability));

        const delayRisk: 'LOW' | 'MEDIUM' | 'HIGH' =
          reliability >= 85 ? 'LOW' : reliability >= 72 ? 'MEDIUM' : 'HIGH';

        // Duration text
        const h = Math.floor(durationMin / 60);
        const m = durationMin % 60;
        const durationText = `${h}h ${m}m`;

        return {
          trainNumber: trainNum,
          trainName,
          trainType,
          fromStation: {
            code: item.from?.code || from,
            name: item.from?.name || from,
            departureTime: depTime,
          },
          toStation: {
            code: item.to?.code || to,
            name: item.to?.name || to,
            arrivalTime: arrTime,
          },
          durationHours,
          durationText,
          distanceKm: dist,
          reliabilityScore: reliability,
          delayRisk,
          runsOnDays: item.train?.runDays || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
          rankScore: reliability,
        };
      });

      // Cache raw for 10 minutes
      setCache(cacheKey, options, 600);
      return this.sortOptions(options, preference);
    } catch (err) {
      console.warn('PlannerService error, returning fallback:', err);
      return [];
    }
  }

  private static sortOptions(
    options: PlannerOption[],
    preference: 'reliable' | 'fastest' | 'lowest_delay' | 'earliest'
  ): PlannerOption[] {
    const list = [...options];

    switch (preference) {
      case 'fastest':
        return list.sort((a, b) => a.durationHours - b.durationHours);
      case 'lowest_delay':
        return list.sort((a, b) => {
          const riskWeight = { LOW: 0, MEDIUM: 1, HIGH: 2 };
          return riskWeight[a.delayRisk] - riskWeight[b.delayRisk] || b.reliabilityScore - a.reliabilityScore;
        });
      case 'earliest':
        return list.sort((a, b) => a.fromStation.departureTime.localeCompare(b.fromStation.departureTime));
      case 'reliable':
      default:
        return list.sort((a, b) => b.reliabilityScore - a.reliabilityScore || a.durationHours - b.durationHours);
    }
  }
}
