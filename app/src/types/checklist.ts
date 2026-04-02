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
