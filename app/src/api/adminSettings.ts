// src/api/adminSettings.ts
import apiClient from './client';

export interface AdminSettingsResponse {
  confirm_mech_enabled: boolean;
  confirm_elec_enabled: boolean;
  confirm_tm_enabled: boolean;
  confirm_pi_enabled: boolean;
  confirm_qi_enabled: boolean;
  confirm_si_enabled: boolean;
  confirm_checklist_required: boolean;
  [key: string]: unknown;
}

export async function getAdminSettings(): Promise<AdminSettingsResponse> {
  const { data } = await apiClient.get<AdminSettingsResponse>('/api/admin/settings');
  return data;
}

export async function updateAdminSettings(
  updates: Partial<AdminSettingsResponse>
): Promise<{ message: string; updated_keys: string[] }> {
  const { data } = await apiClient.put<{ message: string; updated_keys: string[] }>(
    '/api/admin/settings', updates,
  );
  return data;
}
