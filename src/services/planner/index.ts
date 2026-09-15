import { PlannerOption } from '@/types';
import { getCached, setCache } from '@/lib/cache';

export interface PlanQueryParams {
  from: string;
  to: string;
  date?: string;
  preference?: 'reliable' | 'fastest' | 'lowest_delay' | 'earliest';
}

function scoreStation(s: any, query: string): number {
  let score = 0;
  const q = query.trim().toUpperCase();
  const code = (s.code || '').toUpperCase();
  const name = (s.name || '').toUpperCase();
  const city = (s.city || '').toUpperCase();

  if (code === q) score += 1000;
  else if (code.startsWith(q)) score += 500;

  if (city === q || name === q) score += 400;
  else if (city.startsWith(q) || name.startsWith(q)) score += 250;

  if (name.includes('CENTRAL') || code === 'CNB' || code === 'NDLS' || code === 'MMCT' || code === 'MAS' || code === 'SBC') {
    score += 300;
  }
  if (name.includes(' JN') || name.includes(' JUNCTION')) score += 200;
  if (name.includes('TERMINUS') || name.includes('TERMINAL') || code === 'CSMT' || code === 'HWH') score += 150;
  if (name.includes('CANTT') || name.includes('CANTONMENT')) score += 100;

  if (typeof s.popularity === 'number') {
    score += s.popularity * 5;
  }
  if (s.isActive !== false) score += 50;

  return score;
}

export class PlannerService {
  private static baseUrl = 'https://api.railradar.in/v1';

  private static getApiKey(): string {
    return process.env.RAILRADAR_API_KEY || '';
  }

  /**
   * Dynamically resolves any city or station name into its Indian Railways station code.
   * e.g. "Patna" -> "PNBE", "Bangalore" -> "SBC", "Delhi" -> "NDLS"
   */
  static async resolveStation(input: string): Promise<string> {
    const raw = input.trim();
    if (!raw) return '';

    // If already 2-5 uppercase letters/numbers with no spaces, treat as potential code
    const isCode = /^[A-Za-z0-9]{2,6}$/.test(raw);
    const upper = raw.toUpperCase();

    // Check fast cache
    const cacheKey = `stn:resolve:${upper}`;
    const cached = getCached<string>(cacheKey);
    if (cached) return cached;

    // Direct common city shortcuts
    const shortcuts: Record<string, string> = {
      DELHI: 'NDLS',
      'NEW DELHI': 'NDLS',
      MUMBAI: 'MMCT',
      BOMBAY: 'MMCT',
      AGRA: 'AGC',
      LUCKNOW: 'LKO',
      KANPUR: 'CNB',
      VARANASI: 'BSB',
      BANARAS: 'BSB',
      BHOPAL: 'BPL',
      HOWRAH: 'HWH',
      KOLKATA: 'HWH',
      CALCUTTA: 'HWH',
      AHMEDABAD: 'ADI',
      CHENNAI: 'MAS',
      MADRAS: 'MAS',
      BANGALORE: 'SBC',
      BENGALURU: 'SBC',
      PUNE: 'PUNE',
      JAIPUR: 'JP',
      PATNA: 'PNBE',
      GORAKHPUR: 'GKP',
      HYDERABAD: 'HYB',
      SECUNDERABAD: 'SC',
      CHANDIGARH: 'CDG',
      AMRITSAR: 'ASR',
      DEHRADUN: 'DDN',
      GUWAHATI: 'GHY',
      RANCHI: 'RNC',
      INDORE: 'INDB',
      GOA: 'MAO',
      MADGAON: 'MAO',
    };

    if (shortcuts[upper]) {
      setCache(cacheKey, shortcuts[upper], 86400);
      return shortcuts[upper];
    }

    if (isCode && upper.length <= 5) {
      return upper;
    }

    // Dynamic lookup from RailRadar database with smart hub ranking
    try {
      const apiKey = this.getApiKey();
      const res = await fetch(
        `${this.baseUrl}/lookup/search/stations?q=${encodeURIComponent(raw)}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'x-api-key': apiKey,
          },
        }
      );

      if (res.ok) {
        const json = await res.json();
        const stations = Array.isArray(json.data) ? json.data : [];
        if (stations.length > 0) {
          const sorted = [...stations]
            .filter((s: any) => s.isActive !== false)
            .sort((a, b) => scoreStation(b, raw) - scoreStation(a, raw));

          const best = sorted[0] || stations[0];
          if (best && best.code) {
            setCache(cacheKey, best.code, 86400);
            return best.code;
          }
        }
      }
    } catch {
      // Ignore and fallback
    }

    return upper;
  }

  /**
   * Directly look up any train by number or name and return it formatted as a planner journey option.
   */
  static async findTrainDirect(query: string): Promise<PlannerOption[]> {
    const raw = query.trim();
    if (!raw) return [];

    const cacheKey = `planner:direct:${raw.toLowerCase()}`;
    const cached = getCached<PlannerOption[]>(cacheKey);
    if (cached && cached.length > 0) return cached;

    try {
      const apiKey = this.getApiKey();
      const res = await fetch(
        `${this.baseUrl}/lookup/search/trains?q=${encodeURIComponent(raw)}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'x-api-key': apiKey,
          },
        }
      );

      if (!res.ok) return [];
      const json = await res.json();
      const rawTrains = Array.isArray(json.data) ? json.data.slice(0, 8) : [];

      const options: PlannerOption[] = await Promise.all(
        rawTrains.map(async (t: any) => {
          const trainNum = t.number || '';
          const trainName = t.name || `Train ${trainNum}`;
          const trainType = t.type || 'Express';
          const srcCode = t.source || t.sourceCode || 'ORIG';
          const srcName = t.sourceName || srcCode;
          const dstCode = t.dest || t.destCode || 'DEST';
          const dstName = t.destName || dstCode;

          let reliability = 82;
          const lowerType = trainType.toLowerCase();
          if (
            lowerType.includes('vande') ||
            lowerType.includes('rajdhani') ||
            lowerType.includes('shatabdi') ||
            lowerType.includes('tejas')
          ) {
            reliability = 94;
          } else if (
            lowerType.includes('superfast') ||
            lowerType.includes('duronto') ||
            lowerType.includes('humsafar')
          ) {
            reliability = 88;
          } else if (lowerType.includes('mail')) {
            reliability = 78;
          } else if (lowerType.includes('passenger') || lowerType.includes('local') || lowerType.includes('emu')) {
            reliability = 68;
          }

          const delayRisk: 'LOW' | 'MEDIUM' | 'HIGH' =
            reliability >= 85 ? 'LOW' : reliability >= 74 ? 'MEDIUM' : 'HIGH';

          let depTime = '--:--';
          let arrTime = '--:--';
          let durationText = 'Direct Route';
          let dist = 450;
          let runDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

          try {
            const liveRes = await fetch(`${this.baseUrl}/trains/${trainNum}/live`, {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'x-api-key': apiKey,
              },
            });
            if (liveRes.ok) {
              const liveJson = await liveRes.json();
              if (Array.isArray(liveJson.data?.train?.runDays)) {
                runDays = liveJson.data.train.runDays;
              }
              const route = liveJson.data?.route || [];
              if (route.length > 0) {
                const first = route[0];
                const last = route[route.length - 1];
                if (first?.scheduledDeparture) {
                  depTime = new Date(first.scheduledDeparture).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  });
                }
                if (last?.scheduledArrival) {
                  arrTime = new Date(last.scheduledArrival).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  });
                }
                if (last?.distance) dist = Math.round(last.distance);
                if (first?.scheduledDeparture && last?.scheduledArrival) {
                  const diffMs =
                    new Date(last.scheduledArrival).getTime() - new Date(first.scheduledDeparture).getTime();
                  if (diffMs > 0) {
                    const hrs = Math.floor(diffMs / 3600000);
                    const mins = Math.floor((diffMs % 3600000) / 60000);
                    durationText = `${hrs}h ${mins}m`;
                  }
                }
              }
            }
          } catch {
            // fallback gracefully
          }

          return {
            trainNumber: trainNum,
            trainName,
            trainType,
            fromStation: {
              code: srcCode,
              name: srcName,
              departureTime: depTime,
            },
            toStation: {
              code: dstCode,
              name: dstName,
              arrivalTime: arrTime,
            },
            durationHours: 10,
            durationText,
            distanceKm: dist,
            reliabilityScore: reliability,
            delayRisk,
            runsOnDays: runDays,
            rankScore: reliability,
          };
        })
      );

      if (options.length > 0) {
        setCache(cacheKey, options, 600);
      }
      return options;
    } catch (err) {
      console.warn('findTrainDirect error:', err);
      return [];
    }
  }

  static async findTrainsBetween(params: PlanQueryParams): Promise<PlannerOption[]> {
    const rawFrom = params.from.trim();
    const rawTo = params.to.trim();
    if (!rawFrom || !rawTo) return [];

    const [from, to] = await Promise.all([
      this.resolveStation(rawFrom),
      this.resolveStation(rawTo),
    ]);

    if (!from || !to) return [];

    const preference = params.preference || 'reliable';
    const cacheKey = `planner:${from}:${to}:${params.date || 'any'}`;
    const cached = getCached<PlannerOption[]>(cacheKey);
    if (cached && cached.length > 0) {
      return this.sortOptions(cached, preference);
    }

    try {
      const apiKey = this.getApiKey();

      // 1. Fetch trains between stations
      let url = `${this.baseUrl}/trains/between/${from}/${to}${params.date ? `?date=${params.date}` : ''}`;
      let res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'x-api-key': apiKey,
        },
      });

      let json: any = null;
      let rawTrains: any[] = [];

      if (res.ok) {
        json = await res.json();
        rawTrains = Array.isArray(json.data?.trains)
          ? json.data.trains
          : Array.isArray(json.data)
          ? json.data
          : [];
      }

      // 2. If date filter resulted in 0 trains, fall back to fetching all trains on this route
      if (rawTrains.length === 0 && params.date) {
        const fallbackUrl = `${this.baseUrl}/trains/between/${from}/${to}`;
        const fallbackRes = await fetch(fallbackUrl, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'x-api-key': apiKey,
          },
        });
        if (fallbackRes.ok) {
          const fbJson = await fallbackRes.json();
          rawTrains = Array.isArray(fbJson.data?.trains)
            ? fbJson.data.trains
            : Array.isArray(fbJson.data)
            ? fbJson.data
            : [];
        }
      }

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
        if (
          lowerType.includes('vande') ||
          lowerType.includes('rajdhani') ||
          lowerType.includes('shatabdi') ||
          lowerType.includes('tejas')
        ) {
          reliability = 92;
        } else if (
          lowerType.includes('superfast') ||
          lowerType.includes('duronto') ||
          lowerType.includes('humsafar')
        ) {
          reliability = 86;
        } else if (lowerType.includes('mail')) {
          reliability = 76;
        } else if (lowerType.includes('passenger') || lowerType.includes('local') || lowerType.includes('emu')) {
          reliability = 68;
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

      // Cache for 10 minutes
      if (options.length > 0) {
        setCache(cacheKey, options, 600);
      }
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
