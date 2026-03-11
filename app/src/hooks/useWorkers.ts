// src/hooks/useWorkers.ts
// 작업자 목록 TanStack Query 훅

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkers, toggleManager } from '@/api/workers';

export function useWorkers() {
  return useQuery({
    queryKey: ['workers'],
    queryFn: getWorkers,
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
