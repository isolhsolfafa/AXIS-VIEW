// src/hooks/useEtlChanges.ts
// ETL 변경 이력 TanStack Query 훅

import { useQuery } from '@tanstack/react-query';
import { getEtlChanges } from '@/api/etl';
import type { EtlChangesParams } from '@/api/etl';

export function useEtlChanges(params: EtlChangesParams = {}) {
  return useQuery({
    queryKey: ['etl-changes', params],
    queryFn: () => getEtlChanges(params),
    staleTime: 60_000, // 1분 캐시
  });
}
