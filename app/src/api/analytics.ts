// src/api/analytics.ts
// 사용자 분석 API 호출

import apiClient from './client';

/* ── 타입 정의 ── */

export interface AnalyticsSummary {
  period: string;
  unique_workers: number;
  total_requests: number;
  avg_response_ms: number;
  error_rate: number;
  daily: DailyMetric[];
  prev_unique_workers?: number;
  prev_error_rate?: number;
}

export interface DailyMetric {
  date: string;
  unique_workers: number;
  total_requests: number;
  error_count: number;
}

export interface WorkerAnalytics {
  worker_id: number;
  name: string;
  email: string;
  role: string;
  company: string;
  access_count: number;
  total_duration_min: number;
  top_endpoints: string[];
}

export interface EndpointAnalytics {
  endpoint: string;
  method: string;
  call_count: number;
  avg_response_ms: number;
  error_count: number;
}

export interface HourlyTraffic {
  hour: number;
  count: number;
}

export interface AnalyticsSummaryResponse {
  summary: AnalyticsSummary;
}

export interface WorkerAnalyticsResponse {
  workers: WorkerAnalytics[];
  total: number;
}

export interface EndpointAnalyticsResponse {
  endpoints: EndpointAnalytics[];
}

export interface HourlyResponse {
  date: string;
  hourly: HourlyTraffic[];
}

/* ── API 호출 ── */

export async function getAnalyticsSummary(period: string = '7d'): Promise<AnalyticsSummaryResponse> {
  const { data } = await apiClient.get<AnalyticsSummaryResponse>(
    `/api/admin/analytics/summary?period=${period}`
  );
  return data;
}

export async function getWorkerAnalytics(period: string = '30d'): Promise<WorkerAnalyticsResponse> {
  const { data } = await apiClient.get<WorkerAnalyticsResponse>(
    `/api/admin/analytics/by-worker?period=${period}`
  );
  return data;
}

export async function getEndpointAnalytics(period: string = '7d'): Promise<EndpointAnalyticsResponse> {
  const { data } = await apiClient.get<EndpointAnalyticsResponse>(
    `/api/admin/analytics/by-endpoint?period=${period}`
  );
  return data;
}

export async function getHourlyTraffic(date: string): Promise<HourlyResponse> {
  const { data } = await apiClient.get<HourlyResponse>(
    `/api/admin/analytics/hourly?date=${date}`
  );
  return data;
}
