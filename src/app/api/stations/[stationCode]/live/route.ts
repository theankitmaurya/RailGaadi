import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/services/analytics';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ stationCode: string }> }
) {
  try {
    const { stationCode } = await params;
    if (!stationCode) {
      return NextResponse.json(
        { error: { code: 'INVALID_CODE', message: 'Station code is required' } },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '4', 10);

    const [liveTrains, stationInfo] = await Promise.all([
      AnalyticsService.getStationLiveBoard(stationCode, hours),
      Promise.resolve(AnalyticsService.getStationInfo(stationCode)),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        station: stationInfo,
        trains: liveTrains,
      },
    });
  } catch (error) {
    console.error('Station live API error:', error);
    return NextResponse.json(
      { error: { code: 'STATION_API_ERROR', message: 'Failed to fetch station board' } },
      { status: 500 }
    );
  }
}
