// src/types/snStatus.ts
// S/N 작업 현황 카드뷰 타입 — Sprint 18

// GET /api/app/product/progress 응답 타입
export interface SNProduct {
  serial_number: string;
  model: string;
  customer: string;
  ship_plan_date: string | null;
  all_completed: boolean;
  all_completed_at: string | null;
  overall_percent: number;
  categories: Record<string, { total: number; done: number; percent: number }>;
  my_category: string | null;
  last_worker: string | null;         // Sprint 38 이후
  last_activity_at: string | null;    // Sprint 38 이후
  last_task_name: string | null;      // Sprint 38-B 이후
  last_task_category: string | null;  // Sprint 38-B 이후
}

export interface SNProgressResponse {
  products: SNProduct[];
  summary: { total: number; in_progress: number; completed_recent: number };
}

// GET /tasks/<serial_number>?all=true 응답 타입
export interface TaskWorker {
  worker_id: number;
  worker_name: string;
  started_at: string | null;
  completed_at: string | null;
  duration_minutes: number | null;
  status: 'completed' | 'in_progress' | 'not_started';
  task_name?: string;  // 병합 시 주입 — 상세뷰에서 작업 구분용
}

export interface SNTaskDetail {
  id: number;
  task_name: string;
  task_category: string;
  workers: TaskWorker[];
  my_status: string;
}
