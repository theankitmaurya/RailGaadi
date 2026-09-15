import { NextRequest, NextResponse } from 'next/server';
import { webpush, configureWebPush } from '@/lib/webpush';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription, trainNumber = '12002', trainName = 'Bhopal Shatabdi' } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: { code: 'NO_SUBSCRIPTION', message: 'Subscription is required to send notification' } },
        { status: 400 }
      );
    }

    configureWebPush();

    const payload = JSON.stringify({
      title: `🚆 RailGaadi Alert: ${trainNumber}`,
      body: `${trainName} is currently approaching Mathura Jn. Running with +12m delay. Estimated arrival: 07:15 AM.`,
      trainNumber,
      url: `/journey/${trainNumber}`,
    });

    await webpush.sendNotification(subscription, payload);

    return NextResponse.json({
      success: true,
      message: 'Test notification delivered successfully!',
    });
  } catch (error: any) {
    console.error('Push test error:', error);
    return NextResponse.json(
      { error: { code: 'SEND_FAILED', message: error.message || 'Failed to dispatch push notification' } },
      { status: 500 }
    );
  }
}
