'use client';

import { useQuery } from '@tanstack/react-query';
import { TrainRoute } from '@/types';

export function useTrainRoute(trainId: string) {
  return useQuery<TrainRoute>({
    queryKey: ['trainRoute', trainId],
    queryFn: async () => {
      const res = await fetch(`/api/trains/${trainId}/route`);
      if (!res.ok) throw new Error('Failed to fetch route');
      const json = await res.json();
      return json.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour stale time for route geometry
  });
}
