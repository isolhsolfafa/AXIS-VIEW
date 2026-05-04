// src/hooks/useGetTasksByOrder.ts
// Sprint 40 — 같은 O/N 의 Tank Module task 일괄 조회 (P2 다중 카테고리)

import { useQuery } from '@tanstack/react-query';
import { getTasksByOrder, type GetTasksByOrderOptions } from '@/api/snStatus';
import type { SNTaskDetail } from '@/types/snStatus';

interface UseGetTasksByOrderOptions extends GetTasksByOrderOptions {
  enabled?: boolean;
}

export function useGetTasksByOrder(
  salesOrder: string | null,
  options?: UseGetTasksByOrderOptions,
) {
  return useQuery<SNTaskDetail[]>({
    queryKey: ['sn', 'tasks-by-order', salesOrder, options?.taskCategories, options?.taskId],
    queryFn: () => getTasksByOrder(salesOrder!, options),
    enabled: !!salesOrder && (options?.enabled ?? true),
    staleTime: 30 * 1000,
  });
}
