// src/hooks/useSNProgress.ts
// S/N 진행 현황 조회 hook — Sprint 18

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getSNProgress } from '@/api/snStatus';

export function useSNProgress() {
  return useQuery({
    queryKey: ['sn', 'progress'],
    queryFn: getSNProgress,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
