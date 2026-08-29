export type RunningState =
  | 'ON_TIME'
  | 'DELAYED'
  | 'EARLY'
  | 'UNKNOWN'
  | 'NOT_STARTED'
  | 'COMPLETED'
  | 'DATA_UNAVAILABLE';

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface Train {
  id: string;
  number: string;
  name: string;
  originStationId: string;
  originName: string;
  originCode: string;
  destinationStationId: string;
  destinationName: string;
  destinationCode: string;
  totalDistanceKm: number;
  durationHours: number;
}

export interface Station {
  id: string;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
}

export interface RouteStation {
  station: Station;
  sequence: number;
  distanceFromOriginKm: number;
  scheduledArrival?: string;
  scheduledDeparture?: string;
  actualArrival?: string;
  actualDeparture?: string;
  delayMinutes: number;
  status: 'PASSED' | 'CURRENT' | 'UPCOMING';
  platform?: string;
  elevationMeters?: number;
}

export interface TrainRoute {
  trainId: string;
  stations: RouteStation[];
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  totalDistanceKm: number;
}

export interface JourneyProgress {
  percentage: number;
  distanceCoveredKm: number;
  distanceRemainingKm: number;
}

export interface JourneyStatus {
  train: Train;
  state: RunningState;
  delayMinutes: number;
  currentStation?: RouteStation;
  nextStation?: RouteStation;
  location?: GeoCoordinate;
  headingAngle?: number;
  progress: JourneyProgress;
  speedKph?: number;
  lastUpdated: string;
}

export interface WeatherSnapshot {
  temperatureC: number;
  humidityPercent: number;
  windSpeedKph: number;
  precipitationProbability?: number;
  condition: string;
  conditionIcon: string;
  observedAt: string;
  locationName: string;
}

export interface JourneyWeather {
  current?: WeatherSnapshot;
  nextStation?: WeatherSnapshot;
  destination?: WeatherSnapshot;
  routeForecast: Array<{
    stationName: string;
    temperatureC: number;
    condition: string;
    conditionIcon: string;
  }>;
}

export interface ElevationPoint {
  distanceKm: number;
  elevationMeters: number;
  stationName?: string;
}

export interface JourneyElevation {
  highestElevationMeters: number;
  lowestElevationMeters: number;
  profile: ElevationPoint[];
}

export type PoiCategory =
  | 'RIVER'
  | 'LAKE'
  | 'MOUNTAIN'
  | 'BRIDGE'
  | 'TUNNEL'
  | 'MONUMENT'
  | 'ATTRACTION'
  | 'CITY'
  | 'GHAT';

export interface NearbyFeature {
  id: string;
  name: string;
  category: PoiCategory;
  distanceFromTrainKm: number;
  description: string;
  latitude: number;
  longitude: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    retryable?: boolean;
  };
}

export interface ShareTokenData {
  token: string;
  trainId: string;
  created: string;
  status: JourneyStatus;
}
