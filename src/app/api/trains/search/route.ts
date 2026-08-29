import { NextRequest, NextResponse } from 'next/server';
import { TrainService } from '@/services/train';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ data: [] });
    }

    const trains = await TrainService.searchTrains(query);
    return NextResponse.json({ data: trains });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'SEARCH_FAILED',
          message: 'Failed to search trains. Please try again.',
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}
