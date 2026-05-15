// src/api/checklist.ts
// 체크리스트 API — Sprint 26 (BE Sprint 52 연동) / Sprint 42 (자재 매핑 endpoint 추가)

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
import type { Material } from './materials';

// ── Sprint 42: 자재 매핑 (M-NEW-3 round-trip — legacy string[] | 신규 number[] union) ──

export interface ChecklistMasterOption {
  master_id: number;
  item_name: string;
  select_options_raw: number[] | string[];  // M-NEW-3: legacy string | 신규 int union
  materials: Material[];                     // BE _enrich_select_options() — legacy = 빈 배열
}

export async function getChecklistMasterOptions(masterId: number): Promise<ChecklistMasterOption> {
  const { data } = await apiClient.get<ChecklistMasterOption>(
    `/api/admin/checklists/master/${masterId}/options`,
  );
  return data;
}

export async function updateChecklistMasterOptions(
  masterId: number,
  materialIds: number[],
): Promise<void> {
  await apiClient.patch(
    `/api/admin/checklists/master/${masterId}/options`,
    { material_ids: materialIds },
  );
}

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
  // BE 실제 필드명 (TM/ELEC/MECH 공통 _get_checklist_by_category): master_id / check_result / checked_by_name
  master_id?: number;
  check_result?: 'PASS' | 'NA' | null;
  checked_by_name?: string | null;
  // legacy 가정 필드명 (fallback) — 일부 엔드포인트 호환
  id?: number;
  status?: 'PASS' | 'NA' | null;
  worker_name?: string | null;
  item_group: string;
  item_name: string;
  item_type: 'CHECK' | 'INPUT' | 'SELECT';
  description?: string | null;
  checked_at?: string | null;
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
  // 카테고리 → BE 경로 매핑 (Sprint 31: ELEC, Sprint 63-BE: MECH 엔드포인트 활용)
  const CAT_MAP: Record<string, string> = {
    TM: 'tm',
    TMS: 'tm',
    ELEC: 'elec',
    MECH: 'mech',
  };

  const beCat = CAT_MAP[category];
  if (!beCat) {
    // 미매핑 카테고리 — 빈 응답
    return { ...EMPTY_CHECKLIST, serial_number: serialNumber, category };
  }

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

    const items: ChecklistStatusItem[] = flatItems.map((item, i) => {
      // BE 실제 필드명 우선 (master_id / check_result / checked_by_name), legacy 가정 필드명 fallback
      const masterId = item.master_id ?? item.id ?? i;
      const result = item.check_result ?? item.status ?? null;
      return {
        master_id: masterId,
        item_group: item.item_group ?? '',
        item_name: item.item_name,
        item_type: item.item_type ?? 'CHECK',
        description: item.description ?? null,
        record: result ? {
          id: masterId,
          serial_number: serialNumber,
          master_id: masterId,
          status: result,
          note: null,
          judgment_round: 1,
          worker_id: 0,
          worker_name: item.checked_by_name ?? item.worker_name ?? '',
          checked_at: item.checked_at ?? '',
        } : null,
      };
    });

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

  // BE→FE 필드 매핑 보정
  if (data.categories) {
    for (const cat of data.categories) {
      // summary: BE checked → FE completed
      if (cat.summary && cat.summary.checked != null && cat.summary.completed == null) {
        (cat.summary as any).completed = cat.summary.checked;
      }
      // items 매핑
      cat.items = (cat.items ?? []).map((item: any) => ({
        ...item,
        result: item.result ?? item.check_result ?? null,
        worker_name: item.worker_name ?? item.checked_by_name ?? null,
        input_value: item.input_value ?? item.value ?? null,
        selected_value: item.selected_value ?? null,
        checker_role: item.checker_role ?? null,
      }));
    }
  }

  return data;
}
