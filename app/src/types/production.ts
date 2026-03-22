// src/types/production.ts
// 생산실적 API 타입 정의

export interface ProcessProgress {
  total: number;
  done: number;
  pct: number;
  tank_module_done?: boolean;
  pressure_test_done?: boolean;
}

export interface SNProgress {
  MECH: ProcessProgress;
  ELEC: ProcessProgress;
  TM: ProcessProgress;
}

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

export interface ProcessStatus {
  ready: number;
  total: number;
  checklist_ready?: number;
  confirmable: boolean;
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
  processes: {
    MECH: ProcessStatus;
    ELEC: ProcessStatus;
    TM: ProcessStatus;
  };
  confirms: ConfirmRecord[];
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
