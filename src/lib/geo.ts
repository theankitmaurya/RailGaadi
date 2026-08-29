import * as turf from '@turf/turf';
import { GeoCoordinate } from '@/types';

/**
 * Calculates bearing angle (0-360 degrees) between two points
 */
export function calculateBearing(start: GeoCoordinate, end: GeoCoordinate): number {
  const point1 = turf.point([start.lng, start.lat]);
  const point2 = turf.point([end.lng, end.lat]);
  return turf.bearing(point1, point2);
}

/**
 * Calculates total distance in kilometers of a line geometry
 */
export function calculateLineDistance(coordinates: [number, number][]): number {
  if (coordinates.length < 2) return 0;
  const line = turf.lineString(coordinates);
  return turf.length(line, { units: 'kilometers' });
}

/**
 * Interpolates point along a route at a given progress distance (km)
 */
export function getPointAlongRoute(
  coordinates: [number, number][],
  distanceKm: number
): { location: GeoCoordinate; heading: number } | null {
  if (!coordinates || coordinates.length < 2) return null;

  const line = turf.lineString(coordinates);
  const totalLength = turf.length(line, { units: 'kilometers' });
  const targetDist = Math.min(Math.max(0, distanceKm), totalLength);

  const currentPoint = turf.along(line, targetDist, { units: 'kilometers' });
  const nextDist = Math.min(targetDist + 0.5, totalLength);
  const nextPoint = turf.along(line, nextDist, { units: 'kilometers' });

  const startCoords = currentPoint.geometry.coordinates;
  const nextCoords = nextPoint.geometry.coordinates;

  const heading = turf.bearing(currentPoint, nextPoint);

  return {
    location: {
      lat: startCoords[1],
      lng: startCoords[0],
    },
    heading: (heading + 360) % 360,
  };
}
