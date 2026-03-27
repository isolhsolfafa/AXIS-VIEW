// src/hooks/useWorkers.ts
// 작업자 목록 + 비활성 관리 TanStack Query 훅

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWorkers, toggleManager,
  getInactiveWorkers, getDeactivatedWorkers, updateWorkerStatus,
  requestDeactivation,
} from '@/api/workers';
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

// Sprint 40-C: 비활성 사용자 관리
export function useInactiveWorkers(days = 30) {
  return useQuery({
    queryKey: ['inactive-workers', days],
    queryFn: () => getInactiveWorkers(days),
    staleTime: 60_000,
  });
}

export function useDeactivatedWorkers() {
  return useQuery({
    queryKey: ['deactivated-workers'],
    queryFn: () => getDeactivatedWorkers(),
    staleTime: 60_000,
  });
}

export function useWorkerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workerId, action }: { workerId: number; action: 'deactivate' | 'reactivate' }) =>
      updateWorkerStatus(workerId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inactive-workers'] });
      queryClient.invalidateQueries({ queryKey: ['deactivated-workers'] });
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
  });
}

// Sprint 40-C: Manager → 비활성화 요청 (admin 알림/이메일 발송)
export function useRequestDeactivation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workerId, reason }: { workerId: number; reason: string }) =>
      requestDeactivation(workerId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
  });
}
