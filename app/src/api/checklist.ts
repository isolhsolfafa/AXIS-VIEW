// src/api/checklist.ts
// 체크리스트 API — Sprint 20
// 목업 단계: mock 데이터 반환. BE 구현 후 apiClient 호출로 교체.

import type {
  ChecklistMasterResponse,
  ChecklistStatusResponse,
  CreateMasterPayload,
  UpdateMasterPayload,
} from '@/types/checklist';
import {
  MOCK_MECH_ITEMS,
  MOCK_TM_ITEMS,
  MOCK_ELEC_ITEMS,
  MOCK_PRODUCT_CODES,
  getMockChecklistStatus,
} from '@/mocks/checklist';

// ── 마스터 CRUD (목업) ──

export async function getChecklistMaster(
  category: string,
  productCode: string,
): Promise<ChecklistMasterResponse> {
  // TODO: BE 구현 후 아래로 교체
  // const { data } = await apiClient.get<ChecklistMasterResponse>(
  //   '/api/admin/checklist/master',
  //   { params: { category, product_code: productCode } },
  // );
  // return data;

  await delay(300);
  const items = category === 'MECH' ? MOCK_MECH_ITEMS
    : category === 'TM' ? MOCK_TM_ITEMS
      : MOCK_ELEC_ITEMS;
  const filtered = items.filter(i => i.product_code === productCode || productCode === '');
  return {
    items: filtered,
    total: filtered.length,
    second_judgment_required: false,
  };
}

export async function createChecklistMaster(
  _data: CreateMasterPayload,
): Promise<{ id: number }> {
  // TODO: BE 구현 후 교체
  // const { data } = await apiClient.post('/api/admin/checklist/master', _data);
  // return data;
  await delay(200);
  return { id: Date.now() };
}

export async function updateChecklistMaster(
  _id: number,
  _data: UpdateMasterPayload,
): Promise<void> {
  // TODO: BE 구현 후 교체
  // await apiClient.put(`/api/admin/checklist/master/${_id}`, _data);
  await delay(200);
}

export async function deleteChecklistMaster(_id: number): Promise<void> {
  // TODO: BE 구현 후 교체
  // await apiClient.delete(`/api/admin/checklist/master/${_id}`);
  await delay(200);
}

// ── Product Code 목록 (목업) ──

export async function getProductCodes(): Promise<string[]> {
  // TODO: BE 구현 후 product_info 테이블에서 active 제품 조회
  await delay(100);
  return MOCK_PRODUCT_CODES;
}

// ── S/N별 체크리스트 상태 조회 (목업) ──

export async function getChecklistStatus(
  serialNumber: string,
  category: string,
): Promise<ChecklistStatusResponse> {
  // TODO: BE 구현 후 아래로 교체
  // const { data } = await apiClient.get<ChecklistStatusResponse>(
  //   `/api/app/checklist/${serialNumber}/${category}`,
  // );
  // return data;

  await delay(200);
  const { items, summary } = getMockChecklistStatus(serialNumber, category);
  return { serial_number: serialNumber, category, items, summary };
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
