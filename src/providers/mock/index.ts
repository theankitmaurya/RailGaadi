import { Train, TrainRoute, JourneyStatus } from '@/types';
import { MOCK_TRAINS, MOCK_ROUTES, getMockJourneyStatus } from './trainData';

export interface ITrainProvider {
  searchTrains(query: string): Promise<Train[]>;
  getJourneyStatus(trainId: string): Promise<JourneyStatus>;
  getRoute(trainId: string): Promise<TrainRoute>;
}

export class MockTrainProvider implements ITrainProvider {
  async searchTrains(query: string): Promise<Train[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matches = MOCK_TRAINS.filter(
      (t) =>
        t.number.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.originName.toLowerCase().includes(q) ||
        t.originCode.toLowerCase().includes(q) ||
        t.destinationName.toLowerCase().includes(q) ||
        t.destinationCode.toLowerCase().includes(q)
    );

    if (matches.length === 0 && /^\d{4,5}$/.test(q)) {
      return [{
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
        durationHours: 14,
      }];
    }

    return matches;
  }

  async getJourneyStatus(trainId: string): Promise<JourneyStatus> {
    return getMockJourneyStatus(trainId);
  }

  async getRoute(trainId: string): Promise<TrainRoute> {
    const route = MOCK_ROUTES[trainId];
    if (route) return route;

    // Fallback default route if specific train route geometry isn't explicitly mocked
    const defaultTrain = MOCK_TRAINS.find((t) => t.id === trainId) || MOCK_TRAINS[0];
    return {
      trainId: defaultTrain.id,
      totalDistanceKm: defaultTrain.totalDistanceKm,
      stations: MOCK_ROUTES['12951'].stations,
      geometry: MOCK_ROUTES['12951'].geometry,
    };
  }
}
