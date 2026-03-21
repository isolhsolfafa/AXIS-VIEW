// src/types/attendance.ts
// 출퇴근 관련 TypeScript 타입 정의

export interface AttendanceRecord {
  worker_id: number;
  worker_name: string;
  company: string;
  role: string;
  check_in_time: string | null;   // ISO8601 KST
  check_out_time: string | null;  // ISO8601 KST
  status: 'working' | 'left' | 'not_checked';
  work_site?: string;
  product_line?: string;
}

export interface AttendanceSummary {
  total_registered: number;
  checked_in: number;
  checked_out: number;
  currently_working: number;
  not_checked: number;
}

export interface CompanySummary {
  company: string;
  total_workers: number;
  checked_in: number;
  checked_out: number;
  currently_working: number;
  not_checked: number;
}

export interface DailyAttendanceResponse {
  date: string;
  records: AttendanceRecord[];
  summary: AttendanceSummary;
}

export interface CompanySummaryResponse {
  date: string;
  by_company: CompanySummary[];
}

// --- 추이 차트 ---

export interface TrendDataPoint {
  date: string;       // "03/17(월)" 형식 표시용
  dateRaw: string;    // "2026-03-17" 원본
  total: number;
  hq: number;
  site: number;
}

export interface AttendanceTrendResponse {
  date_from: string;
  date_to: string;
  trend: Array<{
    date: string;
    total_registered: number;
    checked_in: number;
    hq_count: number;
    site_count: number;
  }>;
}
