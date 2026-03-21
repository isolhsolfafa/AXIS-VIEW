// src/api/workers.ts
// 작업자 관리 API — GET /api/admin/workers, PUT toggle-manager

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
