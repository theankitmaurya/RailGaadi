'use client';

import { useQuery } from '@tanstack/react-query';
import { JourneyStatus } from '@/types';
import { CONFIG } from '@/config';

export function useJourneyStatus(trainId: string, initialData?: JourneyStatus) {
  return useQuery<JourneyStatus>({
    queryKey: ['journeyStatus', trainId],
    queryFn: async () => {
      const res = await fetch(`/api/trains/${trainId}/status`);
      if (!res.ok) throw new Error('Failed to fetch status');
      const json = await res.json();
      return json.data;
    },
    initialData,
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      if (state === 'COMPLETED') return false;
      return CONFIG.api.statusPollIntervalMs;
    },
  });
}
