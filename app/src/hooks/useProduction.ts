// src/hooks/useProduction.ts
// 생산실적 TanStack Query 훅

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPerformance, confirmProduction, cancelConfirm, getMonthlySummary } from '@/api/production';
import type { ConfirmRequest } from '@/types/production';

export function usePerformance(week?: string, month?: string) {
  return useQuery({
    queryKey: ['production', 'performance', week, month],
    queryFn: () => getPerformance(week, month),
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useConfirmProduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ConfirmRequest) => confirmProduction(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['production'] }); },
  });
}

export function useCancelConfirm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (confirmId: number) => cancelConfirm(confirmId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['production'] }); },
  });
}

export function useMonthlySummary(month?: string) {
  return useQuery({
    queryKey: ['production', 'monthly-summary', month],
    queryFn: () => getMonthlySummary(month),
    staleTime: 5 * 60 * 1000,
  });
}
