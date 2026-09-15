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
  type?: string;
  category?: string;
  coachPosition?: string;
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
  isHalt?: boolean;
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

// ── v2 Domain Models & Intelligence Extensions ─────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role?: 'user' | 'admin';
  created_at?: string;
}

export interface FavouriteItem {
  id: string;
  userId?: string;
  type: 'train' | 'station';
  referenceId: string; // Train number or station code
  title: string;
  subtitle?: string;
  addedAt: string;
}

export interface UserJourney {
  id: string;
  userId?: string;
  trainId: string;
  trainName: string;
  sourceCode: string;
  sourceName: string;
  destinationCode: string;
  destinationName: string;
  journeyDate: string;
  shareToken?: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  createdAt: string;
}

export interface StationInfo {
  code: string;
  name: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  platforms?: number;
  facilities: string[];
  averageDelayMin?: number;
  trainsCountDaily?: number;
}

export interface TrainReliability {
  trainNumber: string;
  trainName: string;
  score: number; // 0 to 100
  onTimePercent: number;
  averageDelayMinutes: number;
  delayRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  sampleJourneysCount: number;
}

export interface DelayRecord {
  id: string;
  trainNumber: string;
  stationCode: string;
  stationName: string;
  scheduledArrival?: string;
  actualArrival?: string;
  delayMinutes: number;
  recordedAt: string;
}

export interface DelayPrediction {
  trainNumber: string;
  currentDelayMinutes: number;
  predictedDelayMinutes: number;
  delayDeltaMinutes: number;
  confidencePercent: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  reasoning: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  trainNumber: string;
  title: string;
  body: string;
  type: 'DELAY' | 'STATION_APPROACH' | 'DEPARTURE' | 'COMPLETED';
  createdAt: string;
  read: boolean;
}

export interface PushSubscriptionRecord {
  id?: string;
  userId?: string;
  trainNumber: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  delayThresholdMin?: number;
  created_at?: string;
}

export interface PlannerOption {
  trainNumber: string;
  trainName: string;
  trainType?: string;
  fromStation: { code: string; name: string; departureTime: string };
  toStation: { code: string; name: string; arrivalTime: string };
  durationHours: number;
  durationText: string;
  distanceKm: number;
  reliabilityScore: number;
  delayRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  runsOnDays?: string[];
  rankScore: number;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  insights?: Array<{
    title: string;
    detail: string;
    variant?: 'info' | 'warning' | 'success';
  }>;
}
