// src/api/factory.ts
// 공장 API — OPS Sprint 29 연동

import apiClient from './client';

/* ── #10 월간 생산 현황 ── */

export interface MonthlyDetailParams {
  month?: string;
  date_field?: 'pi_start' | 'mech_start' | 'finishing_plan_end';
  page?: number;
  per_page?: number;
}

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
    shipped: number;           // ⚠️ deprecated — Sprint 35부터 FE 사용 금지, shipped_count 참조
  };
  shipped_count: number;       // Sprint 62-BE 신규 — SI_SHIPMENT UNION actual_ship_date
  defect_count: number | null; // Sprint 62-BE 신규 — QMS 미연동 동안 null
}

/* ── Sprint 35: 월간 KPI (신규) ── */

export interface MonthlyKpiParams {
  month?: string;  // YYYY-MM (기본: 현재 달)
}

export interface MonthlyKpiResponse {
  month: string;                  // "YYYY-MM"
  month_range: { start: string; end: string };
  production_count: number;       // finishing_plan_end 기반 COUNT
  shipped_count: number;
  defect_count: number | null;
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

  const query = searchParams.toString();
  const url = `/api/admin/factory/monthly-kpi${query ? `?${query}` : ''}`;
  const { data } = await apiClient.get<MonthlyKpiResponse>(url);
  return data;
}
