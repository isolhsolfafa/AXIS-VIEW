// src/api/attendance.ts
// 출퇴근 API — VITE_USE_MOCK=true 시 Mock 데이터 반환, false 시 실제 API 호출

import apiClient from './client';
import type { DailyAttendanceResponse, CompanySummaryResponse } from '@/types/attendance';
import { getMockTodayAttendance, getMockCompanySummary } from '@/mocks/attendance';
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
