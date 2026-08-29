import NodeCache from 'node-cache';

// Shared in-memory cache instance for server side API routes
const globalCache = new NodeCache({
  stdTTL: 600, // 10 minutes default
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false,
});

export function getCached<T>(key: string): T | undefined {
  return globalCache.get<T>(key);
}

export function setCache<T>(key: string, value: T, ttlSeconds?: number): boolean {
  if (ttlSeconds !== undefined) {
    return globalCache.set(key, value, ttlSeconds);
  }
  return globalCache.set(key, value);
}

export function deleteCache(key: string): number {
  return globalCache.del(key);
}
