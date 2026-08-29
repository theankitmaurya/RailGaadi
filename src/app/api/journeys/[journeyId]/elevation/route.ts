import { NextRequest, NextResponse } from 'next/server';
import { ElevationService } from '@/services/elevation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ journeyId: string }> }
) {
  try {
    const { journeyId } = await params;
    const elevation = await ElevationService.getJourneyElevation(journeyId);
    return NextResponse.json({ data: elevation });
  } catch (error) {
    console.error('Elevation API error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'ELEVATION_UNAVAILABLE',
          message: 'Elevation data is currently unavailable.',
        },
      },
      { status: 500 }
    );
  }
}
