import { JourneyClient } from '@/components/train/JourneyClient';

export default async function JourneyPage({ params }: { params: Promise<{ trainId: string }> }) {
  const { trainId } = await params;
  return <JourneyClient trainId={trainId} />;
}
