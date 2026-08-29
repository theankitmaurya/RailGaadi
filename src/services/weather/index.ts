import { JourneyWeather } from '@/types';
import { MOCK_WEATHER } from '@/providers/mock/trainData';
import { getCached, setCache } from '@/lib/cache';
import { CONFIG } from '@/config';

export class WeatherService {
  static async getJourneyWeather(journeyId: string): Promise<JourneyWeather> {
    const cacheKey = `weather:${journeyId}`;
    const cached = getCached<JourneyWeather>(cacheKey);
    if (cached) return cached;

    // OpenWeather API integration when OPENWEATHER_API_KEY is available
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      const mockResult: JourneyWeather = {
        current: MOCK_WEATHER.current,
        nextStation: MOCK_WEATHER.nextStation,
        destination: MOCK_WEATHER.destination,
        routeForecast: [
          { stationName: 'Kota', temperatureC: 28, condition: 'Partly Cloudy', conditionIcon: '⛅' },
          { stationName: 'Ratlam', temperatureC: 26, condition: 'Light Rain', conditionIcon: '🌧️' },
          { stationName: 'Vadodara', temperatureC: 30, condition: 'Clear', conditionIcon: '☀️' },
          { stationName: 'Surat', temperatureC: 31, condition: 'Humid', conditionIcon: '🌤️' },
          { stationName: 'Mumbai Central', temperatureC: 31, condition: 'Overcast', conditionIcon: '☁️' },
        ],
      };
      setCache(cacheKey, mockResult, CONFIG.cacheTTLs.weatherSec);
      return mockResult;
    }

    try {
      // In production with API key, query real endpoints here
      const mockResult: JourneyWeather = {
        current: MOCK_WEATHER.current,
        nextStation: MOCK_WEATHER.nextStation,
        destination: MOCK_WEATHER.destination,
        routeForecast: [],
      };
      setCache(cacheKey, mockResult, CONFIG.cacheTTLs.weatherSec);
      return mockResult;
    } catch (err) {
      console.warn('Weather API error:', err);
      return { current: MOCK_WEATHER.current, routeForecast: [] };
    }
  }
}
