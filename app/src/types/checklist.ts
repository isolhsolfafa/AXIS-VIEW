// src/types/checklist.ts
// 체크리스트 타입 — Sprint 26 (BE Sprint 52 필드 기준)

// checklist_master 항목
export interface ChecklistMasterItem {
  id: number;
  product_code: string;
  category: 'MECH' | 'ELEC' | 'TM';
  item_group: string;
  item_name: string;
  item_type: 'CHECK' | 'INPUT';
  item_order: number;
  description: string | null;
  is_active: boolean;
}

// 마스터 목록 응답
export interface ChecklistMasterResponse {
  items: ChecklistMasterItem[];
  total: number;
}

// 마스터 항목 생성 페이로드
export interface CreateMasterPayload {
  product_code: string;
  category: string;
  item_group: string;
  item_name: string;
  item_type: 'CHECK' | 'INPUT';
  description?: string;
  item_order?: number;
}

// 마스터 항목 수정 페이로드
export interface UpdateMasterPayload {
  item_group?: string;
  item_name?: string;
  item_type?: 'CHECK' | 'INPUT';
  description?: string;
  item_order?: number;
  is_active?: boolean;
}

// checklist_record (S/N별 검사 결과)
export interface ChecklistRecord {
  id: number;
  serial_number: string;
  master_id: number;
  status: 'PASS' | 'NA' | null;
  note: string | null;
  judgment_round: number;
  worker_id: number;
  worker_name: string;
  checked_at: string;
}

// S/N별 체크리스트 조회 응답
export interface ChecklistStatusResponse {
  serial_number: string;
  category: string;
  items: ChecklistStatusItem[];
  summary: {
    total_check: number;
    completed: number;
    percent: number;
  };
}

export interface ChecklistStatusItem {
  master_id: number;
  item_group: string;
  item_name: string;
  item_type: 'CHECK' | 'INPUT';
  description: string | null;
  record: ChecklistRecord | null;
}

// ── 성적서용 타입 (Sprint 28) ──

/** S/N 성적서 — 전체 카테고리 체크리스트 통합 */
export interface ChecklistReportData {
  serial_number: string;
  model: string;
  sales_order: string | null;    // O/N
  customer: string;
  categories: ChecklistReportCategory[];
  generated_at: string;           // 조회 시점
}

export interface ChecklistReportCategory {
  category: 'MECH' | 'ELEC' | 'TM';
  label: string;                  // 기구 / 전장 / TM
  items: ChecklistReportItem[];
  summary: {
    total: number;
    completed: number;
    percent: number;
  };
}

export interface ChecklistReportItem {
  item_group: string;
  item_name: string;
  item_type: 'CHECK' | 'INPUT';
  description: string | null;
  result: 'PASS' | 'NA' | null;         // CHECK 타입
  input_value: string | null;            // INPUT 타입 (MECH)
  worker_name: string | null;
  checked_at: string | null;
}

/** O/N 기준 S/N 목록 조회 */
export interface OrderSNListResponse {
  sales_order: string;
  products: {
    serial_number: string;
    model: string;
    overall_percent: number;
  }[];
}
