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
