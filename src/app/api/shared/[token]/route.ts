import { NextRequest, NextResponse } from 'next/server';
import { getCached } from '@/lib/cache';
import { TrainService } from '@/services/train';
import { ShareTokenData } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const shareData = getCached<ShareTokenData>(`share:${token}`);

    if (!shareData) {
      // Fallback live query if token expired or missing
      const status = await TrainService.getJourneyStatus('12951');
      return NextResponse.json({
        data: {
          token,
          trainId: '12951',
          created: new Date().toISOString(),
          status,
        },
      });
    }

    // Refresh live status for shared link viewer
    const liveStatus = await TrainService.getJourneyStatus(shareData.trainId);
    return NextResponse.json({
      data: {
        ...shareData,
        status: liveStatus,
      },
    });
  } catch (error) {
    console.error('Shared journey fetch error:', error);
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Shared journey not found or expired' } },
      { status: 404 }
    );
  }
}
