// src/types/snStatus.ts
// S/N 작업 현황 카드뷰 타입 — Sprint 18

// GET /api/app/product/progress 응답 타입
export interface SNProduct {
  serial_number: string;
  model: string;
  customer: string;
  ship_plan_date: string | null;
  sales_order: string | null;      // O/N — BE #51 후 활성화
  all_completed: boolean;
  all_completed_at: string | null;
  overall_percent: number;
  categories: Record<string, { total: number; done: number; percent: number }>;
  my_category: string | null;
  last_worker: string | null;         // Sprint 38 이후
  last_activity_at: string | null;    // Sprint 38 이후
  last_task_name: string | null;      // Sprint 38-B 이후
  last_task_category: string | null;  // Sprint 38-B 이후
  // Sprint 34 (FE-20 / FE-21, v1.33.0): BE FIX-25 progress API flat 확장
  // BE 미배포 시 undefined → 현행 UI와 동일 동작 (안전 degrade)
  mech_partner?: string | null;        // MECH 카테고리 담당 협력사 (예: "에스이엔지", "GST")
  elec_partner?: string | null;        // ELEC 카테고리 담당 협력사
  module_outsourcing?: string | null;  // TMS 카테고리 담당 (실질 고정값 "TMS")
  line?: string | null;                // 고객사 공정 라인 (예: "TW(F16)", "JP(F15)")
}

export interface SNProgressResponse {
  products: SNProduct[];
  summary: { total: number; in_progress: number; completed_recent: number };
}

// GET /tasks/<serial_number>?all=true 응답 타입
export interface TaskWorker {
  worker_id: number;
  worker_name: string;
  company?: string | null;   // Sprint 33: Manager 행 레벨 권한 (#60)
  started_at: string | null;
  completed_at: string | null;
  duration_minutes: number | null;
  status: 'completed' | 'in_progress' | 'not_started';
  task_name?: string;        // 병합 시 주입 — 상세뷰에서 작업 구분용
  task_detail_id?: number;   // 병합 시 주입 — 재활성화 API 호출용 (Sprint 23)
  // FE-19.1 (v1.32.1): per-row 강제종료 표시용 — SNDetailPanel 병합 시 부모 task에서 전파
  force_closed?: boolean;
  close_reason?: string;
  closed_by_name?: string;
  force_closed_at?: string | null;  // 부모 task.completed_at (force_closed=true일 때 표시용)
}

export interface SNTaskDetail {
  id: number;                // = app_task_details.id
  task_name: string;
  task_category: string;
  workers: TaskWorker[];
  my_status: string;
  force_closed?: boolean;    // Sprint 33: 강제종료 뱃지 (#61)
  close_reason?: string;     // FE-19 (HOTFIX-04): 강제종료 사유
  closed_by_name?: string;   // FE-19 (HOTFIX-04): 처리자 원문(마스킹 전) — VIEW에서 maskName() 적용
  completed_at?: string | null; // FE-19 (HOTFIX-04): placeholder row 종료 시각 표시
}
