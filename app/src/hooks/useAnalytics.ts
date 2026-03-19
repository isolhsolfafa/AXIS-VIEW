// src/hooks/useAnalytics.ts
// 사용자 분석 TanStack Query 훅

import { useQuery } from '@tanstack/react-query';
import {
  getAnalyticsSummary,
  getWorkerAnalytics,
  getEndpointAnalytics,
  getHourlyTraffic,
} from '@/api/analytics';

export function useAnalyticsSummary(period: string = '7d') {
  return useQuery({
    queryKey: ['analytics', 'summary', period],
    queryFn: () => getAnalyticsSummary(period),
    staleTime: 2 * 60 * 1000,
  });
}

export function useWorkerAnalytics(period: string = '30d') {
  return useQuery({
    queryKey: ['analytics', 'by-worker', period],
    queryFn: () => getWorkerAnalytics(period),
    staleTime: 2 * 60 * 1000,
  });
}

export function useEndpointAnalytics(period: string = '7d') {
  return useQuery({
    queryKey: ['analytics', 'by-endpoint', period],
    queryFn: () => getEndpointAnalytics(period),
    staleTime: 2 * 60 * 1000,
  });
}

export function useHourlyTraffic(date: string) {
  return useQuery({
    queryKey: ['analytics', 'hourly', date],
    queryFn: () => getHourlyTraffic(date),
    staleTime: 2 * 60 * 1000,
  });
}
