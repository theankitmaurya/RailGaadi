import { NextRequest, NextResponse } from 'next/server';
import { WeatherService } from '@/services/weather';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ journeyId: string }> }
) {
  try {
    const { journeyId } = await params;
    const weather = await WeatherService.getJourneyWeather(journeyId);
    return NextResponse.json({ data: weather });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'WEATHER_UNAVAILABLE',
          message: 'Weather data is currently unavailable.',
        },
      },
      { status: 500 }
    );
  }
}
