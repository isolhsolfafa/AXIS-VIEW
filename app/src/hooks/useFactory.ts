// src/hooks/useFactory.ts
// 공장 API TanStack Query 훅

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getMonthlyDetail, getWeeklyKpi, getMonthlyKpi,
  type MonthlyDetailParams, type WeeklyKpiParams, type MonthlyKpiParams,
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

// Sprint 35 신규
export function useMonthlyKpi(
  params: MonthlyKpiParams & {
    enabled?: boolean;
    refetchInterval?: RefetchInterval;
  } = {},
) {
  const { enabled, refetchInterval, ...apiParams } = params;
  return useQuery({
    queryKey: ['factory', 'monthly-kpi', apiParams],
    queryFn: () => getMonthlyKpi(apiParams),
    staleTime: 5 * 60 * 1000,
    enabled: enabled ?? true,
    refetchInterval: refetchInterval ?? false,
    placeholderData: keepPreviousData, // Codex M3: 첫 스와이프 시 빈 카드 깜빡임 완화
  });
}
