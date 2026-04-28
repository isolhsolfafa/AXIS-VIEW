// src/api/factory.ts
// 공장 API — OPS Sprint 29 연동

import apiClient from './client';

/* ── #10 월간 생산 현황 ── */

export interface MonthlyDetailParams {
  month?: string;
  date_field?: 'pi_start' | 'mech_start' | 'finishing_plan_end' | 'ship_plan_date' | 'actual_ship_date';
  page?: number;
  per_page?: number;
}

// Sprint 35 Phase 2 (v1.35.0): monthly-kpi 전용 4옵션 (pi_start 제외, BE _MONTHLY_KPI_DATE_FIELDS와 정합)
export type MonthlyKpiDateField = 'mech_start' | 'finishing_plan_end' | 'ship_plan_date' | 'actual_ship_date';

// Sprint 36 (v1.37.0, BE v2.4 대응): 출하 완료 기준 3옵션 재구조
// - 'plan'   : ship_plan_date + (actual_ship_date OR si_shipment) 기준 (v2.4 OR 조건 교정)
// - 'actual' : actual_ship_date 기준 (FE 기본값, 현 상반기)
// - 'best'   : actual + si 통합 (해석 A: si ⊆ actual 가정, 정합성 100% 후 기본값 예정)
// - 'ops'    : ⚠️ v2.4 에서 폐기 — backward compat 무관, 토큰 자체 제거
export type ShippedBasis = 'plan' | 'actual' | 'best';

export interface CompletionStatus {
  mech: boolean;
  elec: boolean;
  tm: boolean | null;
  pi: boolean;
  qi: boolean;
  si: boolean;
}

export interface CategoryProgress {
  total: number;
  completed: number;
  pct: number;
}

export interface TaskProgress {
  total: number;
  completed: number;
  progress_pct: number;
  by_category: Record<string, CategoryProgress>;
}

export interface ProductionItem {
  sales_order: string;
  product_code: string;
  serial_number: string;
  model: string;
  customer: string;
  line: string;
  mech_partner: string;
  elec_partner: string;
  mech_start: string | null;
  mech_end: string | null;
  elec_start: string | null;
  elec_end: string | null;
  pi_start: string | null;
  qi_start: string | null;
  si_start: string | null;
  finishing_plan_end: string | null;
  ship_plan_date: string | null;
  completion: CompletionStatus;
  progress_pct: number;
  task_progress?: TaskProgress;
}

export interface ModelCount {
  model: string;
  count: number;
}

export interface MonthlyDetailResponse {
  month: string;
  items: ProductionItem[];
  by_model: ModelCount[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

/* ── #9 주간 KPI ── */

export interface WeeklyKpiParams {
  week?: number;
  year?: number;
}

export interface WeeklyKpiResponse {
  week: number;
  year: number;
  week_range: { start: string; end: string };
  production_count: number;
  completion_rate: number;
  by_model: ModelCount[];
  by_stage: {
    mech: number;
    elec: number;
    tm: number;
    pi: number;
    qi: number;
    si: number;
  };
  pipeline: {
    pi: number;
    qi: number;
    si: number;
    shipped: number;           // ⚠️ deprecated — Sprint 35부터 FE 사용 금지 (backward compat 유지용)
  };
  // Sprint 62-BE v2.4 (3필드 재구조, ops 폐기)
  shipped_plan?: number;       // v2.4: ship_plan_date + (actual OR si_shipment) OR 조건 (교정)
  shipped_actual?: number;     // actual_ship_date 기준 (FE 기본값, 변동 없음)
  shipped_best?: number;       // v2.4 신설: actual + si 통합 (해석 A 기반)
  shipped_ops?: number;        // ⚠️ v2.4 에서 폐기 예정 — BE 미배포 동안 fallback 호환용으로 optional 유지
  defect_count?: number | null; // QMS 미연동 동안 null
}

/* ── Sprint 35: 월간 KPI (신규) ── */

export interface MonthlyKpiParams {
  month?: string;               // YYYY-MM (기본: 현재 달)
  date_field?: MonthlyKpiDateField;  // Phase 2 (v2.2): 4옵션 토글 (기본 mech_start)
}

export interface MonthlyKpiResponse {
  month: string;                       // "YYYY-MM"
  month_range: { start: string; end: string };
  date_field_used?: MonthlyKpiDateField; // Phase 2 (v2.2): 클라이언트 토글 검증용
  production_count: number;            // date_field 기준 COUNT
  // Sprint 62-BE v2.4 출하 3필드 (ops 폐기, best 신설)
  shipped_plan?: number;
  shipped_actual?: number;
  shipped_best?: number;       // v2.4 신설
  shipped_ops?: number;        // ⚠️ v2.4 에서 폐기 — BE 미배포 동안 fallback 호환용
  defect_count?: number | null;
  // by_model 미포함 — 월간 차트는 monthly-detail 엔드포인트 재활용
}

/* ── API 호출 ── */

export async function getMonthlyDetail(params: MonthlyDetailParams = {}): Promise<MonthlyDetailResponse> {
  const searchParams = new URLSearchParams();
  if (params.month) searchParams.set('month', params.month);
  if (params.date_field) searchParams.set('date_field', params.date_field);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.per_page) searchParams.set('per_page', String(params.per_page));

  const query = searchParams.toString();
  const url = `/api/admin/factory/monthly-detail${query ? `?${query}` : ''}`;
  const { data } = await apiClient.get<MonthlyDetailResponse>(url);
  return data;
}

export async function getWeeklyKpi(params: WeeklyKpiParams = {}): Promise<WeeklyKpiResponse> {
  const searchParams = new URLSearchParams();
  if (params.week) searchParams.set('week', String(params.week));
  if (params.year) searchParams.set('year', String(params.year));

  const query = searchParams.toString();
  const url = `/api/admin/factory/weekly-kpi${query ? `?${query}` : ''}`;
  const { data } = await apiClient.get<WeeklyKpiResponse>(url);
  return data;
}

export async function getMonthlyKpi(params: MonthlyKpiParams = {}): Promise<MonthlyKpiResponse> {
  const searchParams = new URLSearchParams();
  if (params.month) searchParams.set('month', params.month);
  if (params.date_field) searchParams.set('date_field', params.date_field);  // Phase 2 (v2.2): 4옵션 토글

  const query = searchParams.toString();
  const url = `/api/admin/factory/monthly-kpi${query ? `?${query}` : ''}`;
  const { data } = await apiClient.get<MonthlyKpiResponse>(url);
  return data;
}
