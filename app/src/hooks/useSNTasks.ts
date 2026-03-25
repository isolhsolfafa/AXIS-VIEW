// src/hooks/useSNTasks.ts
// S/N 상세 작업자 이력 hook — Sprint 18

import { useQuery } from '@tanstack/react-query';
import { getSNTasks } from '@/api/snStatus';

export function useSNTasks(serialNumber: string | null) {
  return useQuery({
    queryKey: ['sn', 'tasks', serialNumber],
    queryFn: () => getSNTasks(serialNumber!),
    enabled: !!serialNumber,
    staleTime: 30 * 1000,
  });
}
