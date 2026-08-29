import { SharedJourneyClient } from '@/components/sharing/SharedJourneyClient';

export default async function SharedJourneyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <SharedJourneyClient token={token} />;
}
