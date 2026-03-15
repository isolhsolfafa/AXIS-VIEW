// src/hooks/useFactory.ts
// 공장 API TanStack Query 훅

import { useQuery } from '@tanstack/react-query';
import {
  getMonthlyDetail, getWeeklyKpi,
  type MonthlyDetailParams, type WeeklyKpiParams,
} from '@/api/factory';

export function useMonthlyDetail(params: MonthlyDetailParams = {}) {
  return useQuery({
    queryKey: ['factory', 'monthly-detail', params],
    queryFn: () => getMonthlyDetail(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useWeeklyKpi(params: WeeklyKpiParams = {}) {
  return useQuery({
    queryKey: ['factory', 'weekly-kpi', params],
    queryFn: () => getWeeklyKpi(params),
    staleTime: 5 * 60 * 1000,
  });
}
