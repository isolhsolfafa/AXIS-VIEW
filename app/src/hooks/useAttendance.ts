// src/hooks/useAttendance.ts
// 출퇴근 데이터 TanStack Query 훅 — 설정 연동 자동 갱신

import { useQuery } from '@tanstack/react-query';
import { getAttendanceToday, getAttendanceByDate, getAttendanceSummary } from '@/api/attendance';
import { useSettings } from '@/hooks/useSettings';

// 근무 시간대 판단: 07:00~17:20
function isWorkingHours(): boolean {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  // 07:00 (420분) ~ 17:20 (1040분)
  return totalMinutes >= 420 && totalMinutes <= 1040;
}

/**
 * 출퇴근 현황 조회 훅
 * @param date - 날짜 문자열 (YYYY-MM-DD), 없으면 오늘
 */
export function useAttendanceToday(date?: string) {
  const { settings } = useSettings();
  const intervalMs = settings.refreshInterval > 0
    ? settings.refreshInterval * 60 * 1000
    : false;

  return useQuery({
    queryKey: ['attendance', 'today', date],
    queryFn: () => (date ? getAttendanceByDate(date) : getAttendanceToday()),
    refetchInterval: isWorkingHours() ? intervalMs : false,
    staleTime: 60 * 1000, // 1분
  });
}

/**
 * 회사별 출근 인원 요약 훅
 */
export function useAttendanceSummary() {
  const { settings } = useSettings();
  const intervalMs = settings.refreshInterval > 0
    ? settings.refreshInterval * 60 * 1000
    : false;

  return useQuery({
    queryKey: ['attendance', 'summary'],
    queryFn: getAttendanceSummary,
    refetchInterval: isWorkingHours() ? intervalMs : false,
    staleTime: 60 * 1000,
  });
}
