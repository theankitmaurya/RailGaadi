import { NextRequest, NextResponse } from 'next/server';
import { PlannerService } from '@/services/planner';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    const date = searchParams.get('date') || undefined;
    const preference = (searchParams.get('preference') as any) || 'reliable';

    if (!from || !to) {
      return NextResponse.json(
        { error: { code: 'MISSING_PARAMS', message: 'Both "from" and "to" station codes are required.' } },
        { status: 400 }
      );
    }

    const trains = await PlannerService.findTrainsBetween({
      from,
      to,
      date,
      preference,
    });

    return NextResponse.json({
      success: true,
      data: trains,
      meta: {
        from,
        to,
        count: trains.length,
        preference,
      },
    });
  } catch (error) {
    console.error('Planner API error:', error);
    return NextResponse.json(
      { error: { code: 'PLANNER_ERROR', message: 'Failed to find trains for journey plan.' } },
      { status: 500 }
    );
  }
}
