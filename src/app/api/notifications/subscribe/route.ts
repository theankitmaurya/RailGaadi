import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { setCache } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trainNumber, subscription, delayThresholdMin = 15 } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: { code: 'INVALID_SUBSCRIPTION', message: 'Valid push subscription is required' } },
        { status: 400 }
      );
    }

    const trainNum = trainNumber || 'ALL';

    // 1. Try to save to Supabase push_subscriptions table
    try {
      const supabase = createServerSupabaseClient();
      await supabase.from('push_subscriptions').upsert(
        {
          train_number: trainNum,
          endpoint: subscription.endpoint,
          p256dh_key: subscription.keys.p256dh,
          auth_key: subscription.keys.auth,
          delay_threshold_min: delayThresholdMin,
        },
        { onConflict: 'endpoint' }
      );
    } catch (dbErr) {
      console.warn('Database push subscription notice:', dbErr);
    }

    // 2. Also keep in server cache
    const cacheKey = `sub:${subscription.endpoint.slice(-20)}`;
    setCache(cacheKey, { trainNumber: trainNum, subscription, delayThresholdMin }, 86400 * 7);

    return NextResponse.json({
      success: true,
      message: `Successfully subscribed to alerts for train ${trainNum}`,
    });
  } catch (error) {
    console.error('Push subscribe API error:', error);
    return NextResponse.json(
      { error: { code: 'SUBSCRIBE_FAILED', message: 'Failed to save push subscription' } },
      { status: 500 }
    );
  }
}
