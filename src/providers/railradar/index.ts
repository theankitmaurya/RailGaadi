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
      const [liveRes, routeRes] = await Promise.all([
        fetch(`${this.baseUrl}/trains/${trainId}/live`, { headers: this.getHeaders() }),
        fetch(`${this.baseUrl}/trains/${trainId}/route?format=geojson&stops=true`, { headers: this.getHeaders() }).catch(() => null),
      ]);

      if (!liveRes.ok) throw new Error(`RailRadar live HTTP error: ${liveRes.status}`);
      const json = await liveRes.json();
      if (!json.success || !json.data) {
        return this.fallbackProvider.getJourneyStatus(trainId);
      }

      // Extract station coordinates map from route stops if available
      const coordsMap = new Map<string, { lat: number; lng: number }>();
      if (routeRes && routeRes.ok) {
        try {
          const routeJson = await routeRes.json();
          const stops = routeJson.data?.stops || [];
          for (const s of stops) {
            if (s.code && typeof s.lat === 'number' && typeof s.lng === 'number') {
              coordsMap.set(s.code, { lat: s.lat, lng: s.lng });
            }
          }
        } catch {
          // ignore route json error
        }
      }

      const data = json.data;
      const routeStops = data.route || [];

      const currentStopIndex = routeStops.findIndex((s: any) => s.status === 'at-station' || s.status === 'CURRENT');
      const lastDepartedIndex = routeStops.reduce((acc: number, s: any, idx: number) => s.status === 'departed' ? idx : acc, -1);

      const currentStop = currentStopIndex !== -1 
        ? routeStops[currentStopIndex] 
        : (lastDepartedIndex !== -1 ? routeStops[lastDepartedIndex] : routeStops[0]);
      
      const nextStop = routeStops.find((s: any, idx: number) => idx > (currentStopIndex !== -1 ? currentStopIndex : lastDepartedIndex) && (s.isHalt ?? true));

      const totalDistance = routeStops[routeStops.length - 1]?.distance || data.train?.distance || 1000;
      const coveredKm = data.currentLocation?.distanceFromOriginKm ?? (currentStop?.distance || 0);

      const mapStopToRouteStation = (s: any, isCurrent = false): RouteStation => {
        const code = s.stationCode || s.code;
        const coords = coordsMap.get(code);
        return {
          station: {
            id: code,
            code: code,
            name: s.stationName || s.name || code,
            latitude: coords?.lat || s.lat || 0,
            longitude: coords?.lng || s.lng || 0,
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
        };
      };

      const currCoords = coordsMap.get(currentStop?.stationCode || currentStop?.code || '');
      const location = data.currentLocation?.coordinates
        ? { lat: data.currentLocation.coordinates.lat, lng: data.currentLocation.coordinates.lng }
        : currCoords
        ? { lat: currCoords.lat, lng: currCoords.lng }
        : undefined;

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
        location,
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
      // 1. Fetch GeoJSON route geometry and live telemetry stops in parallel
      const [routeRes, liveRes] = await Promise.all([
        fetch(`${this.baseUrl}/trains/${trainId}/route?format=geojson&stops=true`, { headers: this.getHeaders() }),
        fetch(`${this.baseUrl}/trains/${trainId}/live`, { headers: this.getHeaders() }),
      ]);

      const mockRoute = await this.fallbackProvider.getRoute(trainId);

      let coordinates: [number, number][] = [];
      const coordsMap = new Map<string, { lat: number; lng: number }>();

      if (routeRes.ok) {
        const routeJson = await routeRes.json();
        if (routeJson.success && routeJson.data) {
          if (routeJson.data.geojson?.geometry?.coordinates) {
            coordinates = routeJson.data.geojson.geometry.coordinates;
          } else if (Array.isArray(routeJson.data.coordinates)) {
            coordinates = routeJson.data.coordinates;
          }

          // Populate coordinates for every station from route stops
          if (Array.isArray(routeJson.data.stops)) {
            for (const st of routeJson.data.stops) {
              if (st.code && typeof st.lat === 'number' && typeof st.lng === 'number') {
                coordsMap.set(st.code, { lat: st.lat, lng: st.lng });
              }
            }
          }
        }
      }

      let stations: RouteStation[] = [];

      // 2. Parse live route stops from live telemetry endpoint (contains exact timestamps, delays, distance in km, & statuses!)
      if (liveRes.ok) {
        const liveJson = await liveRes.json();
        if (liveJson.success && Array.isArray(liveJson.data?.route) && liveJson.data.route.length > 0) {
          const routeStops = liveJson.data.route;
          const currentStopIndex = routeStops.findIndex((s: any) => s.status === 'at-station');
          const lastDepartedIndex = routeStops.reduce((acc: number, s: any, idx: number) => s.status === 'departed' ? idx : acc, -1);

          stations = routeStops.map((s: any, idx: number) => {
            let stationStatus: 'PASSED' | 'CURRENT' | 'UPCOMING' = 'UPCOMING';
            if (s.status === 'at-station' || (currentStopIndex === -1 && idx === lastDepartedIndex)) {
              stationStatus = 'CURRENT';
            } else if (s.status === 'departed' || idx < lastDepartedIndex) {
              stationStatus = 'PASSED';
            }

            const code = s.stationCode || s.code;
            const coords = coordsMap.get(code);

            return {
              station: {
                id: code,
                code: code,
                name: s.stationName || s.name || code,
                latitude: coords?.lat || s.lat || 0,
                longitude: coords?.lng || s.lng || 0,
              },
              sequence: s.sequence || idx + 1,
              scheduledArrival: s.scheduledArrival,
              scheduledDeparture: s.scheduledDeparture,
              actualArrival: s.actualArrival,
              actualDeparture: s.actualDeparture,
              delayMinutes: s.delayArrival || s.delayDeparture || 0,
              status: stationStatus,
              platform: s.platform,
              distanceFromOriginKm: s.distance ?? (s.distanceFromOriginKm || 0),
            };
          });
        }
      }

      if (stations.length === 0) {
        stations = mockRoute.stations;
      }

      const totalDistance = stations[stations.length - 1]?.distanceFromOriginKm || mockRoute.totalDistanceKm || 1000;

      return {
        trainId: trainId,
        geometry: {
          type: 'LineString',
          coordinates: coordinates.length > 0 ? coordinates : mockRoute.geometry.coordinates,
        },
        stations: stations,
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
