// src/api/workers.ts
// 작업자 관리 API — GET /api/admin/workers, PUT toggle-manager

import apiClient from './client';
import type { Worker } from '@/types/auth';

export interface WorkersResponse {
  workers: Worker[];
  total: number;
}

export async function getWorkers(): Promise<WorkersResponse> {
  const { data } = await apiClient.get<WorkersResponse>('/api/admin/workers');
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
