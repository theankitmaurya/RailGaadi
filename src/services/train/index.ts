import { trainProvider } from '@/providers/railradar';
import { getCached, setCache } from '@/lib/cache';
import { CONFIG } from '@/config';
import { Train, TrainRoute, JourneyStatus } from '@/types';

export class TrainService {
  static async searchTrains(query: string): Promise<Train[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const cacheKey = `search:${q}`;
    const cached = getCached<Train[]>(cacheKey);
    if (cached && cached.length > 0) return cached;

    let results = await trainProvider.searchTrains(q);

    if (results.length === 0 && /^\d{4,5}$/.test(q)) {
      results = [{
        id: q,
        number: q,
        name: `Train ${q}`,
        originStationId: 'ORIG',
        originCode: 'ORIG',
        originName: 'Origin Station',
        destinationStationId: 'DEST',
        destinationCode: 'DEST',
        destinationName: 'Destination Station',
        totalDistanceKm: 1000,
        durationHours: 12,
      }];
    }

    if (results.length > 0) {
      setCache(cacheKey, results, CONFIG.cacheTTLs.trainSearchSec);
    }
    return results;
  }

  static async getJourneyStatus(trainId: string): Promise<JourneyStatus> {
    const cacheKey = `status:${trainId}`;
    const cached = getCached<JourneyStatus>(cacheKey);
    if (cached) return cached;

    const status = await trainProvider.getJourneyStatus(trainId);
    // Short 15s cache for live position & telemetry updates
    setCache(cacheKey, status, 15);
    return status;
  }

  static async getRoute(trainId: string): Promise<TrainRoute> {
    const cacheKey = `route:${trainId}`;
    const cached = getCached<TrainRoute>(cacheKey);
    
    // Only return cached route if it contains valid live station telemetry (distance > 0 or arrival time present)
    if (cached && cached.stations?.some((s) => s.distanceFromOriginKm > 0 || !!s.scheduledArrival)) {
      return cached;
    }

    const route = await trainProvider.getRoute(trainId);
    if (route && route.stations?.some((s) => s.distanceFromOriginKm > 0 || !!s.scheduledArrival)) {
      setCache(cacheKey, route, 30); // 30s TTL for live route telemetry updates
    }
    return route;
  }
}
