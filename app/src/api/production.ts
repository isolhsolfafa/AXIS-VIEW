// src/api/production.ts
// 생산실적 API 호출

import apiClient from './client';
import type {
  PerformanceResponse, ConfirmRequest, ConfirmResponse,
  CancelConfirmResponse, MonthlySummaryResponse,
} from '@/types/production';

export async function getPerformance(week?: string, month?: string): Promise<PerformanceResponse> {
  const params = new URLSearchParams();
  if (week) params.set('week', week);
  if (month) params.set('month', month);
  const query = params.toString();
  const { data } = await apiClient.get<PerformanceResponse>(
    `/api/admin/production/performance${query ? `?${query}` : ''}`,
  );
  return data;
}

export async function confirmProduction(body: ConfirmRequest): Promise<ConfirmResponse> {
  const { data } = await apiClient.post<ConfirmResponse>(
    '/api/admin/production/confirm', body,
  );
  return data;
}

export async function cancelConfirm(confirmId: number): Promise<CancelConfirmResponse> {
  const { data } = await apiClient.delete<CancelConfirmResponse>(
    `/api/admin/production/confirm/${confirmId}`,
  );
  return data;
}

export async function getMonthlySummary(month?: string): Promise<MonthlySummaryResponse> {
  const query = month ? `?month=${month}` : '';
  const { data } = await apiClient.get<MonthlySummaryResponse>(
    `/api/admin/production/monthly-summary${query}`,
  );
  return data;
}
