import { JourneyElevation } from '@/types';
import { MOCK_ELEVATION } from '@/providers/mock/trainData';
import { getCached, setCache } from '@/lib/cache';
import { CONFIG } from '@/config';

export class ElevationService {
  static async getJourneyElevation(journeyId: string): Promise<JourneyElevation> {
    const cacheKey = `elevation:${journeyId}`;
    const cached = getCached<JourneyElevation>(cacheKey);
    if (cached) return cached;

    setCache(cacheKey, MOCK_ELEVATION, CONFIG.cacheTTLs.elevationSec);
    return MOCK_ELEVATION;
  }
}
