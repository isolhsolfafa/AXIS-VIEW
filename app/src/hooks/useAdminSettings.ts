// src/hooks/useAdminSettings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminSettings, updateAdminSettings } from '@/api/adminSettings';
import type { AdminSettingsResponse } from '@/api/adminSettings';

export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: getAdminSettings,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateAdminSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: Partial<AdminSettingsResponse>) => updateAdminSettings(updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
      qc.invalidateQueries({ queryKey: ['production'] });
    },
  });
}
