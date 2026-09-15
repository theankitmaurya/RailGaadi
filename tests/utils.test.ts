import { describe, it, expect } from 'vitest';
import { formatDelay, getRunningStateInfo, formatDistance, formatTime } from '../src/lib/utils';
import { calculateBearing, getPointAlongRoute } from '../src/lib/geo';

describe('Utility Functions', () => {
  it('formats on time delay correctly', () => {
    const result = formatDelay(0);
    expect(result.text).toBe('On Time');
    expect(result.badgeVariant).toBe('success');
  });

  it('formats positive delay minutes correctly', () => {
    const result = formatDelay(18);
    expect(result.text).toBe('Delayed by 18 min');
    expect(result.shortText).toBe('+18m');
    expect(result.badgeVariant).toBe('error');
  });

  it('formats distance formatted in Indian numbering', () => {
    expect(formatDistance(1386)).toBe('1,386 km');
  });

  it('formats time string safely to 12-hour format', () => {
    expect(formatTime('16:55')).toBe('04:55 PM');
    expect(formatTime('09:30')).toBe('09:30 AM');
  });
});

describe('Geospatial Turf Utils', () => {
  it('calculates bearing angle between points', () => {
    const bearing = calculateBearing(
      { lat: 28.6139, lng: 77.209 },
      { lat: 27.4924, lng: 77.6737 }
    );
    expect(typeof bearing).toBe('number');
  });

  it('interpolates point along route geometry', () => {
    const coords: [number, number][] = [
      [77.209, 28.6139],
      [77.6737, 27.4924],
      [75.8648, 25.2138],
    ];
    const point = getPointAlongRoute(coords, 50);
    expect(point).not.toBeNull();
    expect(point?.location.lat).toBeGreaterThan(0);
    expect(point?.heading).toBeGreaterThanOrEqual(0);
  });
});
