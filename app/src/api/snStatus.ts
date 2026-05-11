// src/api/snStatus.ts
// S/N 작업 현황 API — Sprint 18 + Sprint 40 (Tank Module 시작/종료 + 일괄 처리)

import apiClient from './client';
import type { SNProgressResponse, SNTaskDetail } from '@/types/snStatus';

export async function getSNProgress(): Promise<SNProgressResponse> {
  const { data } = await apiClient.get<SNProgressResponse>('/api/app/product/progress');
  return data;
}

export async function getSNTasks(serialNumber: string): Promise<SNTaskDetail[]> {
  const { data } = await apiClient.get<SNTaskDetail[]>(
    `/api/app/tasks/${serialNumber}?all=true`,
  );
  return Array.isArray(data) ? data : [];
}

// ---- Sprint 40: Tank Module 시작/종료 (단일 + 일괄) ----

export interface StartCompleteResponse {
  id: number;
  task_name: string;
  task_category: string;
  task_id?: string;
  serial_number?: string;
  workers: import('@/types/snStatus').TaskWorker[];
}

export interface BatchResponse {
  succeeded: { task_detail_id: number; updated: StartCompleteResponse }[];
  skipped: {
    task_detail_id: number;
    reason: 'ALREADY_STARTED' | 'ALREADY_COMPLETED' | 'NOT_STARTED' | 'NOT_FOUND' | 'NOT_TANK_MODULE' | 'FORBIDDEN_COMPANY';
  }[];
  total: number;
}

export async function startTask(taskDetailId: number): Promise<StartCompleteResponse> {
  const { data } = await apiClient.post<StartCompleteResponse>(
    '/api/app/work/start',
    { task_detail_id: taskDetailId },
  );
  return data;
}

export async function completeTask(taskDetailId: number): Promise<StartCompleteResponse> {
  const { data } = await apiClient.post<StartCompleteResponse>(
    '/api/app/work/complete',
    { task_detail_id: taskDetailId },
  );
  return data;
}

export async function startTaskBatch(taskDetailIds: number[]): Promise<BatchResponse> {
  const { data } = await apiClient.post<BatchResponse>(
    '/api/app/work/start-batch',
    { task_detail_ids: taskDetailIds },
  );
  return data;
}

export async function completeTaskBatch(taskDetailIds: number[]): Promise<BatchResponse> {
  const { data } = await apiClient.post<BatchResponse>(
    '/api/app/work/complete-batch',
    { task_detail_ids: taskDetailIds },
  );
  return data;
}

export interface GetTasksByOrderOptions {
  taskCategories?: string[];   // P2 화이트리스트 — ['TMS','MECH']
  taskId?: string;             // 'TANK_MODULE'
}

export async function getTasksByOrder(
  salesOrder: string,
  options?: GetTasksByOrderOptions,
): Promise<SNTaskDetail[]> {
  const params = new URLSearchParams();
  if (options?.taskCategories && options.taskCategories.length > 0) {
    params.set('task_categories', options.taskCategories.join(','));
  }
  if (options?.taskId) {
    params.set('task_id', options.taskId);
  }
  const qs = params.toString();
  const url = `/api/app/tasks/by-order/${encodeURIComponent(salesOrder)}${qs ? `?${qs}` : ''}`;
  // v1.43.5: BE Sprint 64-BE 가 { tasks, total } 객체 wrap 으로 응답 (다른 task endpoint 는 배열 직접).
  // 두 형식 모두 호환 — OPS v2.13.1 가 배열 형식으로 정정해도 회귀 0.
  const { data } = await apiClient.get<SNTaskDetail[] | { tasks: SNTaskDetail[]; total?: number }>(url);
  let raw: SNTaskDetail[] = [];
  if (Array.isArray(data)) {
    raw = data;
  } else if (data && Array.isArray((data as { tasks?: unknown }).tasks)) {
    raw = (data as { tasks: SNTaskDetail[] }).tasks;
  }
  // v1.43.6: BE by-order 응답에 workers 필드 누락 catch → undefined.find() TypeError 차단.
  // 다른 누락 가능 필드 (qr_doc_id 등) 도 utils 가 사용하면 추가 가드 필요.
  return raw.map(t => ({
    ...t,
    workers: Array.isArray(t.workers) ? t.workers : [],
  }));
}
