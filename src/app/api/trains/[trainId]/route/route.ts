import { NextRequest, NextResponse } from 'next/server';
import { TrainService } from '@/services/train';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trainId: string }> }
) {
  try {
    const { trainId } = await params;
    if (!trainId) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Train ID is required' } },
        { status: 400 }
      );
    }

    const route = await TrainService.getRoute(trainId);
    return NextResponse.json({ data: route });
  } catch (error) {
    console.error('Train route API error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'ROUTE_UNAVAILABLE',
          message: 'Route data is currently unavailable.',
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}
