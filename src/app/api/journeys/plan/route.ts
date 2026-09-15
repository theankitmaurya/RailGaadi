import { NextRequest, NextResponse } from 'next/server';
import { PlannerService } from '@/services/planner';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from')?.trim() || '';
    const to = searchParams.get('to')?.trim() || '';
    const train = searchParams.get('train')?.trim() || '';
    const date = searchParams.get('date') || undefined;
    const preference = (searchParams.get('preference') as any) || 'reliable';

    // 1. Direct train number or name search
    if (train) {
      const results = await PlannerService.findTrainDirect(train);
      return NextResponse.json({
        success: true,
        data: results,
        meta: { train, count: results.length },
      });
    }

    // 2. If user provided a 4-5 digit train number in from without destination
    if (/^\d{4,5}$/.test(from) && (!to || to.toLowerCase() === 'any')) {
      const results = await PlannerService.findTrainDirect(from);
      return NextResponse.json({
        success: true,
        data: results,
        meta: { train: from, count: results.length },
      });
    }

    if (!from || !to) {
      return NextResponse.json(
        { error: { code: 'MISSING_PARAMS', message: 'Both "from" and "to" station codes or train parameter are required.' } },
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
