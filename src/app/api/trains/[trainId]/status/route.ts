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

    const status = await TrainService.getJourneyStatus(trainId);
    return NextResponse.json({ data: status });
  } catch (error) {
    console.error('Journey status API error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'TRAIN_STATUS_UNAVAILABLE',
          message: 'Live status is temporarily unavailable.',
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}
