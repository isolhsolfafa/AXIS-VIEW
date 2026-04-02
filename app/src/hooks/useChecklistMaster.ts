// src/hooks/useChecklistMaster.ts
// 체크리스트 마스터 CRUD hooks — Sprint 26

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getChecklistMaster,
  createChecklistMaster,
  updateChecklistMaster,
  toggleChecklistMaster,
  getProductCodes,
} from '@/api/checklist';
import type { CreateMasterPayload, UpdateMasterPayload } from '@/types/checklist';

export function useChecklistMaster(category: string, productCode: string, includeInactive = false) {
  return useQuery({
    queryKey: ['checklist', 'master', category, productCode, includeInactive],
    queryFn: () => getChecklistMaster(category, productCode, includeInactive),
    enabled: !!productCode,
    staleTime: 60 * 1000,
  });
}

export function useProductCodes() {
  return useQuery({
    queryKey: ['checklist', 'product-codes'],
    queryFn: getProductCodes,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateMaster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMasterPayload) => createChecklistMaster(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklist', 'master'] });
    },
  });
}

export function useUpdateMaster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMasterPayload }) =>
      updateChecklistMaster(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklist', 'master'] });
    },
  });
}

export function useToggleMaster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => toggleChecklistMaster(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklist', 'master'] });
    },
  });
}
