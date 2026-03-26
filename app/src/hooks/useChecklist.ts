// src/hooks/useChecklist.ts
// S/N별 체크리스트 상태 조회 hook — Sprint 20

import { useQuery } from '@tanstack/react-query';
import { getChecklistStatus } from '@/api/checklist';

export function useChecklist(serialNumber: string | null, category: string | null) {
  return useQuery({
    queryKey: ['checklist', serialNumber, category],
    queryFn: () => getChecklistStatus(serialNumber!, category!),
    enabled: !!serialNumber && !!category,
    staleTime: 60 * 1000,
  });
}
