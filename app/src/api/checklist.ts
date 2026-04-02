// src/api/checklist.ts
// 체크리스트 API — Sprint 26 (BE Sprint 52 연동)

import apiClient from './client';
import type {
  ChecklistMasterResponse,
  ChecklistStatusResponse,
  CreateMasterPayload,
  UpdateMasterPayload,
} from '@/types/checklist';

// ── 마스터 CRUD ──

export async function getChecklistMaster(
  category: string,
  productCode: string,
  includeInactive = false,
): Promise<ChecklistMasterResponse> {
  const { data } = await apiClient.get<ChecklistMasterResponse>(
    '/api/admin/checklist/master',
    { params: { category, product_code: productCode, include_inactive: includeInactive || undefined } },
  );
  return data;
}

export async function createChecklistMaster(
  payload: CreateMasterPayload,
): Promise<{ id: number }> {
  const { data } = await apiClient.post('/api/admin/checklist/master', payload);
  return data;
}

export async function updateChecklistMaster(
  id: number,
  payload: UpdateMasterPayload,
): Promise<void> {
  await apiClient.put(`/api/admin/checklist/master/${id}`, payload);
}

export async function toggleChecklistMaster(id: number): Promise<{ id: number; is_active: boolean }> {
  const { data } = await apiClient.patch(`/api/admin/checklist/master/${id}/toggle`);
  return data;
}

// ── Product Code 목록 ──

export async function getProductCodes(): Promise<string[]> {
  const { data } = await apiClient.get<{ product_codes: string[] }>('/api/admin/product-codes');
  return data.product_codes;
}

// ── S/N별 체크리스트 상태 조회 ──
// TM: BE 구현 완료 (OPS Sprint 52) → 실제 API
// MECH/ELEC: BE 미구현 → 빈 응답 반환

const EMPTY_CHECKLIST: ChecklistStatusResponse = {
  serial_number: '', category: '', items: [],
  summary: { total_check: 0, completed: 0, percent: 0 },
};

export async function getChecklistStatus(
  serialNumber: string,
  category: string,
): Promise<ChecklistStatusResponse> {
  // MECH/ELEC은 BE 미구현 — 빈 응답
  if (category !== 'TM' && category !== 'TMS') {
    return { ...EMPTY_CHECKLIST, serial_number: serialNumber, category };
  }

  const { data } = await apiClient.get<ChecklistStatusResponse>(
    `/api/app/checklist/${serialNumber}/${category}`,
  );
  return data;
}
