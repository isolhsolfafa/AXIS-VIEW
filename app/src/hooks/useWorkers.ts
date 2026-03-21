// src/hooks/useWorkers.ts
// 작업자 목록 TanStack Query 훅

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkers, toggleManager } from '@/api/workers';
import type { WorkersParams } from '@/api/workers';

export function useWorkers(params?: WorkersParams) {
  return useQuery({
    queryKey: ['workers', params],
    queryFn: () => getWorkers(params),
    staleTime: 30_000,
  });
}

export function useToggleManager() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workerId, isManager }: { workerId: number; isManager: boolean }) =>
      toggleManager(workerId, isManager),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
  });
}
