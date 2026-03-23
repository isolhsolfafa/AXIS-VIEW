// src/types/production.ts
// 생산실적 API 타입 정의

export interface ProcessProgress {
  total: number;
  done: number;
  pct: number;
  tank_module_done?: boolean;
  pressure_test_done?: boolean;
}

export type SNProgress = Record<string, ProcessProgress>;

export interface ChecklistStatus {
  completed: boolean;
  completed_at: string | null;
}

export interface SNChecklist {
  MECH: ChecklistStatus;
  ELEC: ChecklistStatus;
}

export interface SNDetail {
  serial_number: string;
  mech_partner: string;
  elec_partner: string;
  progress: SNProgress;
  checklist: SNChecklist;
}

export interface PartnerConfirm {
  partner: string;
  sn_count: number;
  total: number;
  completed: number;
  confirmable: boolean;
  confirmed: boolean;
  confirmed_at: string | null;
  confirm_id: number | null;
}

export interface ProcessStatus {
  ready: number;
  total: number;
  completed?: number;
  pct?: number;
  checklist_ready?: number;
  confirmable: boolean;
  confirmed?: boolean;
  confirmed_at?: string | null;
  confirmed_by?: string | null;
  confirm_id?: number | null;
  mixed?: boolean;
  partner_confirms?: PartnerConfirm[] | null;
}

export interface ConfirmRecord {
  id: number;
  process_type: 'MECH' | 'ELEC' | 'TM';
  confirmed_week: string;
  confirmed_by: string;
  confirmed_at: string;
}

export interface OrderGroup {
  sales_order: string;
  model: string;
  sns: SNDetail[];
  sn_count: number;
  sn_summary: string;
  partner_info: { mech: string; elec: string; mixed: boolean };
  processes: Record<string, ProcessStatus>;
  confirms: ConfirmRecord[];
  // 탭별 필터용 end 날짜 (#35-B)
  mech_end?: string | null;
  elec_end?: string | null;
  module_end?: string | null;
}

export interface PerformanceResponse {
  week: string;
  month: string;
  orders: OrderGroup[];
  summary: {
    total_orders: number;
    mech_confirmable: number;
    elec_confirmable: number;
    tm_confirmable: number;
  };
}

export interface ConfirmRequest {
  sales_order: string;
  process_type: 'MECH' | 'ELEC' | 'TM';
  partner?: string | null;
  confirmed_week: string;
  confirmed_month: string;
}

export interface ConfirmResponse {
  success: boolean;
  confirm_id: number;
  sales_order: string;
  process_type: string;
  confirmed_week: string;
  sn_count: number;
  confirmed_at: string;
}

export interface CancelConfirmResponse {
  success: boolean;
  deleted_id: number;
  sales_order: string;
  process_type: string;
  confirmed_week: string;
  partner?: string | null;
}

export interface ProcessSummary {
  completed: number;
  confirmed: number;
}

export interface WeekSummary {
  week: string;
  mech: ProcessSummary;
  elec: ProcessSummary;
  tm: ProcessSummary;
}

export interface MonthlySummaryResponse {
  month: string;
  weeks: WeekSummary[];
  totals: {
    mech: ProcessSummary;
    elec: ProcessSummary;
    tm: ProcessSummary;
  };
}
