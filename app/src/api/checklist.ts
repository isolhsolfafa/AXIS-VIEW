// src/api/checklist.ts
// 체크리스트 API — Sprint 26 (BE Sprint 52 연동)

import apiClient from './client';
import type {
  ChecklistMasterResponse,
  ChecklistStatusResponse,
  ChecklistStatusItem,
  CreateMasterPayload,
  UpdateMasterPayload,
  ChecklistReportData,
  OrderSNListResponse,
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
// BE 엔드포인트 구조 (Sprint 52):
//   /api/app/checklist/tm/{sn}/status → { is_complete, checked_count, total_count }
//   /api/app/checklist/tm/{sn}        → { items: [...], total } (groups 배열)
// VIEW 기대 구조: ChecklistStatusResponse { serial_number, category, items, summary }

const EMPTY_CHECKLIST: ChecklistStatusResponse = {
  serial_number: '', category: '', items: [],
  summary: { total_check: 0, completed: 0, percent: 0 },
};

interface BeStatusResponse {
  is_complete: boolean;
  checked_count: number;
  total_count: number;
}

interface BeDetailItem {
  id?: number;
  item_group: string;
  item_name: string;
  item_type: 'CHECK' | 'INPUT';
  description?: string | null;
  status?: 'PASS' | 'NA' | null;
  checked_at?: string | null;
  worker_name?: string | null;
}

interface BeDetailResponse {
  items?: BeDetailItem[];
  groups?: { group_name: string; items: BeDetailItem[] }[];
  total?: number;
}

export async function getChecklistStatus(
  serialNumber: string,
  category: string,
): Promise<ChecklistStatusResponse> {
  // MECH/ELEC은 BE 미구현 — 빈 응답
  if (category !== 'TM' && category !== 'TMS') {
    return { ...EMPTY_CHECKLIST, serial_number: serialNumber, category };
  }

  const beCat = 'tm';

  try {
    // status + 상세 병렬 호출
    const [statusRes, detailRes] = await Promise.all([
      apiClient.get<BeStatusResponse>(`/api/app/checklist/${beCat}/${serialNumber}/status`).catch(() => null),
      apiClient.get<BeDetailResponse>(`/api/app/checklist/${beCat}/${serialNumber}`).catch(() => null),
    ]);

    // summary 구성
    const st = statusRes?.data;
    const totalCheck = st?.total_count ?? 0;
    const completed = st?.checked_count ?? 0;
    const percent = totalCheck > 0 ? Math.round((completed / totalCheck) * 100) : 0;

    // items 구성 — groups 배열 또는 items 배열 둘 다 대응
    const detail = detailRes?.data;
    let flatItems: BeDetailItem[] = [];
    if (detail?.groups && Array.isArray(detail.groups)) {
      for (const g of detail.groups) {
        for (const item of g.items ?? []) {
          flatItems.push({ ...item, item_group: item.item_group ?? g.group_name });
        }
      }
    } else if (detail?.items && Array.isArray(detail.items)) {
      flatItems = detail.items;
    }

    const items: ChecklistStatusItem[] = flatItems.map((item, i) => ({
      master_id: item.id ?? i,
      item_group: item.item_group ?? '',
      item_name: item.item_name,
      item_type: item.item_type ?? 'CHECK',
      description: item.description ?? null,
      record: item.status ? {
        id: item.id ?? i,
        serial_number: serialNumber,
        master_id: item.id ?? i,
        status: item.status,
        note: null,
        judgment_round: 1,
        worker_id: 0,
        worker_name: item.worker_name ?? '',
        checked_at: item.checked_at ?? '',
      } : null,
    }));

    return {
      serial_number: serialNumber,
      category,
      items,
      summary: { total_check: totalCheck, completed, percent },
    };
  } catch {
    return { ...EMPTY_CHECKLIST, serial_number: serialNumber, category };
  }
}

// ── 성적서 조회 (Sprint 28) ──

/** O/N 또는 S/N 검색 → S/N 목록 */
export async function searchSNList(opts: {
  query: string;
}): Promise<OrderSNListResponse> {
  const isSN = /^[A-Z]{2,5}-/.test(opts.query.toUpperCase());
  const params = isSN
    ? { serial_number: opts.query }
    : { sales_order: opts.query };

  const { data } = await apiClient.get<OrderSNListResponse>(
    '/api/admin/checklist/report/orders',
    { params },
  );
  return data;
}

/** S/N별 전체 카테고리 체크리스트 성적서 */
export async function getChecklistReport(serialNumber: string): Promise<ChecklistReportData> {
  const { data } = await apiClient.get<ChecklistReportData>(
    `/api/admin/checklist/report/${serialNumber}`,
  );
  return data;
}
