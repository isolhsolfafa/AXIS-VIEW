// src/types/checklist.ts
// 체크리스트 타입 — Sprint 32 (Sprint 60-BE 필드 반영)

// item_type 유니온 — SELECT 추가 (ELEC TUBE 색상 선택 등)
export type ItemType = 'CHECK' | 'INPUT' | 'SELECT';

// checklist_master 항목
export interface ChecklistMasterItem {
  id: number;
  product_code: string;
  category: 'MECH' | 'ELEC' | 'TM';
  item_group: string;
  item_name: string;
  item_type: ItemType;
  item_order: number;
  description: string | null;
  is_active: boolean;
  // Sprint 60-BE 신규
  phase1_applicable: boolean;
  qi_check_required: boolean;
  remarks: string | null;
  checker_role?: 'WORKER' | 'QI';
  select_options?: string[] | null;
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
  item_type: ItemType;
  description?: string;
  item_order?: number;
  // Sprint 60-BE 신규
  phase1_applicable?: boolean;
  qi_check_required?: boolean;
  remarks?: string;
  select_options?: string[];
}

// 마스터 항목 수정 페이로드
export interface UpdateMasterPayload {
  item_group?: string;
  item_name?: string;
  item_type?: ItemType;
  description?: string;
  item_order?: number;
  is_active?: boolean;
  // Sprint 60-BE 신규
  phase1_applicable?: boolean;
  qi_check_required?: boolean;
  remarks?: string;
  select_options?: string[];
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
  item_type: ItemType;
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
  label?: string;                 // 기구 / 전장 / TM
  phase?: number;                 // ELEC 전용: 1 또는 2
  phase_label?: string;           // ELEC: "1차 배선"/"2차 배선", TM DUAL: "L Tank"/"R Tank"
  qr_doc_id?: string;             // TM DUAL: "DOC_xxx-L" / "DOC_xxx-R"
  items: ChecklistReportItem[];
  summary: {
    total: number;
    completed: number;
    checked?: number;             // BE 반환 필드 (completed 대체)
    percent: number;
  };
}

export interface ChecklistReportItem {
  item_group: string;
  item_name: string;
  item_type: 'CHECK' | 'INPUT' | 'SELECT';
  description: string | null;
  result: 'PASS' | 'NA' | null;         // CHECK 타입
  input_value: string | null;            // INPUT 타입 (MECH)
  selected_value: string | null;         // SELECT 타입 (TUBE 색상)
  checker_role?: string | null;          // 'WORKER' | 'QI'
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
