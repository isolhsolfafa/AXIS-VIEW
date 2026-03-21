// src/api/attendance.ts
// 출퇴근 API — VITE_USE_MOCK=true 시 Mock 데이터 반환, false 시 실제 API 호출

import apiClient from './client';
import type { DailyAttendanceResponse, CompanySummaryResponse, AttendanceTrendResponse, TrendDataPoint } from '@/types/attendance';
import { getMockTodayAttendance, getMockCompanySummary, getMockAttendanceTrend } from '@/mocks/attendance';
import { isActiveProductLine } from '@/utils/workSiteMapping';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * 오늘 출퇴근 현황 조회
 */
export async function getAttendanceToday(): Promise<DailyAttendanceResponse> {
  if (USE_MOCK) {
    return getMockTodayAttendance();
  }
  const response = await apiClient.get<DailyAttendanceResponse>(
    '/api/admin/hr/attendance/today'
  );
  const data = response.data;
  data.records = data.records.filter(r => !r.product_line || isActiveProductLine(r.product_line));
  return data;
}

/**
 * 특정 날짜 출퇴근 현황 조회
 */
export async function getAttendanceByDate(date: string): Promise<DailyAttendanceResponse> {
  if (USE_MOCK) {
    // Mock 데이터는 오늘 기준이므로 날짜만 교체
    const data = getMockTodayAttendance();
    return { ...data, date };
  }
  const response = await apiClient.get<DailyAttendanceResponse>(
    `/api/admin/hr/attendance?date=${date}`
  );
  const data = response.data;
  data.records = data.records.filter(r => !r.product_line || isActiveProductLine(r.product_line));
  return data;
}

/**
 * 회사별 출근 인원 요약 조회
 */
export async function getAttendanceSummary(): Promise<CompanySummaryResponse> {
  if (USE_MOCK) {
    return getMockCompanySummary();
  }
  const response = await apiClient.get<CompanySummaryResponse>(
    '/api/admin/hr/attendance/summary'
  );
  return response.data;
}

/**
 * 기간별 출입 추이 조회
 */
export async function getAttendanceTrend(dateFrom: string, dateTo: string): Promise<TrendDataPoint[]> {
  if (USE_MOCK) {
    return getMockAttendanceTrend(dateFrom, dateTo);
  }
  const response = await apiClient.get<AttendanceTrendResponse>(
    '/api/admin/hr/attendance/trend',
    { params: { date_from: dateFrom, date_to: dateTo } },
  );
  return response.data.trend.map(transformTrendPoint);
}

function transformTrendPoint(item: AttendanceTrendResponse['trend'][number]): TrendDataPoint {
  const d = new Date(item.date + 'T00:00:00+09:00');
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const dayName = dayNames[d.getDay()];
  return {
    date: `${mm}/${dd}(${dayName})`,
    dateRaw: item.date,
    total: item.checked_in,
    hq: item.hq_count,
    site: item.site_count,
  };
}
