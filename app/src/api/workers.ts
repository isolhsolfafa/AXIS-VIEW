// src/api/workers.ts
// 작업자 관리 API — GET /api/admin/workers, PUT toggle-manager, 비활성 관리

import apiClient from './client';
import type { Worker } from '@/types/auth';

export interface WorkersResponse {
  workers: Worker[];
  total: number;
}

export interface WorkersParams {
  company?: string;
  is_manager?: boolean;
  limit?: number;
}

// Sprint 40-C: 비활성 사용자 관리 타입
export interface InactiveWorker {
  id: number;
  name: string;
  email: string;
  role: string;
  company: string;
  is_active: boolean;
  last_login_at: string | null;
  deactivated_at: string | null;
  created_at: string | null;
}

export interface InactiveWorkersResponse {
  inactive_workers: InactiveWorker[];
  count: number;
  threshold_days: number;
}

export interface DeactivatedWorkersResponse {
  deactivated_workers: InactiveWorker[];
  count: number;
}

export async function getWorkers(params?: WorkersParams): Promise<WorkersResponse> {
  const queryParams: Record<string, string> = {};
  if (params?.company) queryParams.company = params.company;
  if (params?.is_manager !== undefined) queryParams.is_manager = String(params.is_manager);
  queryParams.limit = String(params?.limit ?? 500);

  const { data } = await apiClient.get<WorkersResponse>('/api/admin/workers', {
    params: queryParams,
  });
  return data;
}

export async function toggleManager(
  workerId: number,
  isManager: boolean
): Promise<{ success: boolean; worker: Worker }> {
  const { data } = await apiClient.put<{ success: boolean; worker: Worker }>(
    `/api/admin/workers/${workerId}/manager`,
    { is_manager: isManager }
  );
  return data;
}

// Sprint 40-C: 비활성 사용자 관리 API
export async function getInactiveWorkers(days = 30): Promise<InactiveWorkersResponse> {
  const { data } = await apiClient.get<InactiveWorkersResponse>('/api/admin/inactive-workers', {
    params: { days },
  });
  return data;
}

export async function getDeactivatedWorkers(): Promise<DeactivatedWorkersResponse> {
  const { data } = await apiClient.get<DeactivatedWorkersResponse>('/api/admin/deactivated-workers');
  return data;
}

export async function updateWorkerStatus(
  workerId: number,
  action: 'deactivate' | 'reactivate'
): Promise<{ message: string; worker_id: number; action: string }> {
  const { data } = await apiClient.post<{ message: string; worker_id: number; action: string }>(
    '/api/admin/worker-status',
    { worker_id: workerId, action },
  );
  return data;
}
