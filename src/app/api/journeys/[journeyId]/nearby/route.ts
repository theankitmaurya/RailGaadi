import { NextRequest, NextResponse } from 'next/server';
import { GeoService } from '@/services/geo';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ journeyId: string }> }
) {
  try {
    const { journeyId } = await params;
    const features = await GeoService.getNearbyFeatures(journeyId);
    return NextResponse.json({ data: features });
  } catch (error) {
    console.error('Nearby API error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'NEARBY_UNAVAILABLE',
          message: 'Nearby POI data is currently unavailable.',
        },
      },
      { status: 500 }
    );
  }
}
