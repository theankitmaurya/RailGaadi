import { Train, TrainRoute, JourneyStatus, RouteStation } from '@/types';
import { ITrainProvider, MockTrainProvider } from '../mock';

export class RailRadarProvider implements ITrainProvider {
  private apiKey?: string;
  private fallbackProvider: MockTrainProvider;
  private baseUrl = 'https://api.railradar.in/v1';

  constructor() {
    this.apiKey = process.env.RAILRADAR_API_KEY;
    this.fallbackProvider = new MockTrainProvider();
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'x-api-key': this.apiKey || '',
      'Content-Type': 'application/json',
    };
  }

  async searchTrains(query: string): Promise<Train[]> {
    if (!this.apiKey) {
      return this.fallbackProvider.searchTrains(query);
    }

    try {
      const res = await fetch(`${this.baseUrl}/lookup/search/trains?q=${encodeURIComponent(query)}`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error(`RailRadar search HTTP error: ${res.status}`);
      const json = await res.json();
      if (!json.success || !Array.isArray(json.data)) {
        return this.fallbackProvider.searchTrains(query);
      }

      return json.data.map((item: any) => ({
        id: item.number,
        number: item.number,
        name: item.name || `Train ${item.number}`,
        originStationId: item.source || item.sourceCode || 'ORIG',
        originCode: item.source || item.sourceCode || 'ORIG',
        originName: item.sourceName || item.source || 'Origin',
        destinationStationId: item.dest || item.destCode || 'DEST',
        destinationCode: item.dest || item.destCode || 'DEST',
        destinationName: item.destName || item.dest || 'Destination',
        totalDistanceKm: item.distance || 1000,
        durationHours: item.durationHours || 16,
      }));
    } catch (err) {
      console.warn('RailRadar search API warning, using mock provider fallback:', err);
      return this.fallbackProvider.searchTrains(query);
    }
  }

  async getJourneyStatus(trainId: string): Promise<JourneyStatus> {
    if (!this.apiKey) {
      return this.fallbackProvider.getJourneyStatus(trainId);
    }

    try {
      const res = await fetch(`${this.baseUrl}/trains/${trainId}/live`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error(`RailRadar live HTTP error: ${res.status}`);
      const json = await res.json();
      if (!json.success || !json.data) {
        return this.fallbackProvider.getJourneyStatus(trainId);
      }

      const data = json.data;
      const routeStops = data.route || [];

      const currentStop = routeStops.find((s: any) => s.status === 'at-station' || s.status === 'CURRENT')
        || routeStops.filter((s: any) => s.status === 'departed').pop();
      const nextStop = routeStops.find((s: any) => s.status === 'upcoming' && (s.isHalt ?? true));

      const totalDistance = routeStops[routeStops.length - 1]?.distance || data.train?.distance || 1000;
      const coveredKm = data.currentLocation?.distanceFromOriginKm ?? (currentStop?.distance || 0);

      const mapStopToRouteStation = (s: any, isCurrent = false): RouteStation => ({
        station: {
          id: s.stationCode || s.code,
          code: s.stationCode || s.code,
          name: s.stationName || s.name || s.stationCode,
          latitude: s.lat || 0,
          longitude: s.lng || 0,
        },
        sequence: s.sequence || 1,
        scheduledArrival: s.scheduledArrival,
        scheduledDeparture: s.scheduledDeparture,
        actualArrival: s.actualArrival,
        actualDeparture: s.actualDeparture,
        delayMinutes: s.delayArrival || s.delayDeparture || 0,
        status: isCurrent
          ? 'CURRENT'
          : s.status === 'departed'
          ? 'PASSED'
          : s.status === 'at-station'
          ? 'CURRENT'
          : 'UPCOMING',
        platform: s.platform,
        distanceFromOriginKm: s.distance || 0,
      });

      return {
        train: {
          id: data.trainNumber,
          number: data.trainNumber,
          name: data.trainName || `Train ${data.trainNumber}`,
          originStationId: routeStops[0]?.stationCode || 'ORIG',
          originCode: routeStops[0]?.stationCode || 'ORIG',
          originName: routeStops[0]?.stationName || 'Origin',
          destinationStationId: routeStops[routeStops.length - 1]?.stationCode || 'DEST',
          destinationCode: routeStops[routeStops.length - 1]?.stationCode || 'DEST',
          destinationName: routeStops[routeStops.length - 1]?.stationName || 'Destination',
          totalDistanceKm: totalDistance,
          durationHours: Math.round(totalDistance / 75),
        },
        state: data.status === 'running'
          ? ((data.delayMinutes || 0) > 15 ? 'DELAYED' : 'ON_TIME')
          : data.status === 'completed'
          ? 'COMPLETED'
          : 'NOT_STARTED',
        delayMinutes: data.delayMinutes || 0,
        speedKph: data.currentLocation?.speedKmh || 0,
        lastUpdated: data.lastUpdatedAt || new Date().toISOString(),
        location: data.currentLocation?.coordinates
          ? { lat: data.currentLocation.coordinates.lat, lng: data.currentLocation.coordinates.lng }
          : undefined,
        progress: {
          distanceCoveredKm: coveredKm,
          distanceRemainingKm: Math.max(0, totalDistance - coveredKm),
          percentage: Math.min(100, Math.round(data.currentLocation?.segmentProgress ? data.currentLocation.segmentProgress * 100 : (coveredKm / (totalDistance || 1)) * 100)),
        },
        currentStation: currentStop ? mapStopToRouteStation(currentStop, true) : undefined,
        nextStation: nextStop ? mapStopToRouteStation(nextStop, false) : undefined,
      };
    } catch (err) {
      console.warn('RailRadar live status API warning, using mock provider fallback:', err);
      return this.fallbackProvider.getJourneyStatus(trainId);
    }
  }

  async getRoute(trainId: string): Promise<TrainRoute> {
    if (!this.apiKey) {
      return this.fallbackProvider.getRoute(trainId);
    }

    try {
      const res = await fetch(`${this.baseUrl}/trains/${trainId}/route?format=geojson&stops=true`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error(`RailRadar route HTTP error: ${res.status}`);
      const json = await res.json();
      if (!json.success || !json.data) {
        return this.fallbackProvider.getRoute(trainId);
      }

      const data = json.data;
      const mockRoute = await this.fallbackProvider.getRoute(trainId);

      // Extract coordinates array for GeoJSON LineString
      let coordinates: [number, number][] = [];
      if (data.geojson?.geometry?.coordinates) {
        coordinates = data.geojson.geometry.coordinates;
      } else if (Array.isArray(data.coordinates)) {
        coordinates = data.coordinates;
      }

      let stations: RouteStation[] = [];
      if (Array.isArray(data.stops) && data.stops.length > 0) {
        stations = data.stops.map((s: any) => ({
          station: {
            id: s.code || s.stationCode,
            code: s.code || s.stationCode,
            name: s.name || s.stationName || s.code,
            latitude: s.lat || 0,
            longitude: s.lng || 0,
          },
          sequence: s.sequence || 1,
          scheduledArrival: s.scheduledArrival,
          scheduledDeparture: s.scheduledDeparture,
          delayMinutes: 0,
          status: 'UPCOMING',
          distanceFromOriginKm: s.distance || 0,
        }));
      } else {
        stations = mockRoute.stations;
      }

      const totalDistance = stations[stations.length - 1]?.distanceFromOriginKm || mockRoute.totalDistanceKm || 1000;

      return {
        trainId: trainId,
        geometry: {
          type: 'LineString',
          coordinates: coordinates.length > 0 ? coordinates : mockRoute.geometry.coordinates,
        },
        stations: stations.length > 0 ? stations : mockRoute.stations,
        totalDistanceKm: totalDistance,
      };
    } catch (err) {
      console.warn('RailRadar route API warning, using mock provider fallback:', err);
      return this.fallbackProvider.getRoute(trainId);
    }
  }
}

// Export singleton provider instance
export const trainProvider: ITrainProvider = new RailRadarProvider();
