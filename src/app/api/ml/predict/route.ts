import { NextRequest, NextResponse } from 'next/server';
import { MLDelayPredictor } from '@/services/ml';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trainId = searchParams.get('trainId');

    if (!trainId) {
      return NextResponse.json(
        { error: { message: 'trainId query param is required' } },
        { status: 400 }
      );
    }

    const prediction = await MLDelayPredictor.predictDelay(trainId);

    return NextResponse.json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    console.error('ML Prediction route error:', error);
    return NextResponse.json(
      { error: { message: 'Failed to compute delay prediction' } },
      { status: 500 }
    );
  }
}
