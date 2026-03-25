// src/hooks/useFactory.ts
// 공장 API TanStack Query 훅

import { useQuery } from '@tanstack/react-query';
import {
  getMonthlyDetail, getWeeklyKpi,
  type MonthlyDetailParams, type WeeklyKpiParams,
} from '@/api/factory';

type RefetchInterval = number | false | (() => number | false);

export function useMonthlyDetail(params: MonthlyDetailParams & { refetchInterval?: RefetchInterval } = {}) {
  const { refetchInterval, ...apiParams } = params;
  return useQuery({
    queryKey: ['factory', 'monthly-detail', apiParams],
    queryFn: () => getMonthlyDetail(apiParams),
    staleTime: 5 * 60 * 1000,
    refetchInterval: refetchInterval ?? false,
  });
}

export function useWeeklyKpi(params: WeeklyKpiParams & { refetchInterval?: RefetchInterval } = {}) {
  const { refetchInterval, ...apiParams } = params;
  return useQuery({
    queryKey: ['factory', 'weekly-kpi', apiParams],
    queryFn: () => getWeeklyKpi(apiParams),
    staleTime: 5 * 60 * 1000,
    refetchInterval: refetchInterval ?? false,
  });
}
