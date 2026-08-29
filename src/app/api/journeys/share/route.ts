import { NextRequest, NextResponse } from 'next/server';
import { setCache, getCached } from '@/lib/cache';
import { TrainService } from '@/services/train';
import { ShareTokenData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trainId } = body;

    if (!trainId) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'Train ID is required' } },
        { status: 400 }
      );
    }

    const token = `rg_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
    const status = await TrainService.getJourneyStatus(trainId);

    const shareData: ShareTokenData = {
      token,
      trainId,
      created: new Date().toISOString(),
      status,
    };

    // Store in cache for 7 days
    setCache(`share:${token}`, shareData, 86400 * 7);

    return NextResponse.json({
      data: {
        token,
        shareUrl: `/shared/${token}`,
        expiresAt: null,
      },
    });
  } catch (error) {
    console.error('Share creation API error:', error);
    return NextResponse.json(
      { error: { code: 'SHARE_FAILED', message: 'Could not generate share link' } },
      { status: 500 }
    );
  }
}
