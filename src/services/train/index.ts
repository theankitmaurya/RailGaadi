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
    if (cached) return cached;

    const results = await trainProvider.searchTrains(q);
    setCache(cacheKey, results, CONFIG.cacheTTLs.trainSearchSec);
    return results;
  }

  static async getJourneyStatus(trainId: string): Promise<JourneyStatus> {
    const cacheKey = `status:${trainId}`;
    const cached = getCached<JourneyStatus>(cacheKey);
    if (cached) return cached;

    const status = await trainProvider.getJourneyStatus(trainId);
    // Short TTL cache for live status (30s)
    setCache(cacheKey, status, 30);
    return status;
  }

  static async getRoute(trainId: string): Promise<TrainRoute> {
    const cacheKey = `route:${trainId}`;
    const cached = getCached<TrainRoute>(cacheKey);
    if (cached) return cached;

    const route = await trainProvider.getRoute(trainId);
    setCache(cacheKey, route, CONFIG.cacheTTLs.routeSec);
    return route;
  }
}
