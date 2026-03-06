// src/mocks/attendance.ts
// 출퇴근 Mock 데이터 — VITE_USE_MOCK=true 환경에서 사용
// 컨셉 HTML 데이터 기준: C&A(22), FNI(22), BAT(20), TMS(E)(17), TMS(M)(8), NONE(5), P&S(4) = 98명
// 본사 32명, 현장 66명, 퇴근 미체크 12명, 평균 출근율 87.8%

import type { DailyAttendanceResponse, CompanySummaryResponse, AttendanceRecord } from '@/types/attendance';

export interface ExtendedAttendanceRecord extends AttendanceRecord {
  location: '본사' | '현장';
  sub_location: string;
}

export interface ExtendedDailyAttendanceResponse {
  date: string;
  records: ExtendedAttendanceRecord[];
  summary: {
    total_registered: number;
    checked_in: number;
    checked_out: number;
    currently_working: number;
    not_checked: number;
    hq_count: number;
    site_count: number;
    avg_attendance_rate: number;
  };
}

// KST 시간 생성
function makeKSTTime(dateStr: string, hour: number, minute: number): string {
  const h = String(hour).padStart(2, '0');
  const m = String(minute).padStart(2, '0');
  return `${dateStr}T${h}:${m}:00+09:00`;
}

function todayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 컨셉 HTML에 맞는 정확한 Mock 데이터 정의
const MOCK_COMPANIES: Array<{
  company: string;
  role: string;
  total: number;
  hq: number;
  site: number;
  not_checked: number;
  alertType: 'warning' | 'danger' | 'ok';
  iconClass: string;
  sub_locations: Array<{ name: string; count: number; location: '본사' | '현장' }>;
}> = [
  {
    company: 'C&A',
    role: 'ELEC',
    total: 22,
    hq: 16,
    site: 6,
    not_checked: 5,
    alertType: 'warning',
    iconClass: 'c1',
    sub_locations: [
      { name: '본사', count: 10, location: '본사' },
      { name: '본사CHI_1', count: 5, location: '본사' },
      { name: '본사CHI_2', count: 1, location: '본사' },
      { name: '현장', count: 6, location: '현장' },
    ],
  },
  {
    company: 'FNI',
    role: 'MECH',
    total: 22,
    hq: 0,
    site: 22,
    not_checked: 4,
    alertType: 'warning',
    iconClass: 'c2',
    sub_locations: [
      { name: '현장', count: 22, location: '현장' },
    ],
  },
  {
    company: 'BAT',
    role: 'MECH',
    total: 20,
    hq: 0,
    site: 20,
    not_checked: 0,
    alertType: 'ok',
    iconClass: 'c3',
    sub_locations: [
      { name: '현장', count: 20, location: '현장' },
    ],
  },
  {
    company: 'TMS(E)',
    role: 'ELEC',
    total: 17,
    hq: 12,
    site: 5,
    not_checked: 2,
    alertType: 'warning',
    iconClass: 'c4',
    sub_locations: [
      { name: '본사', count: 12, location: '본사' },
      { name: '현장', count: 5, location: '현장' },
    ],
  },
  {
    company: 'TMS(M)',
    role: 'MECH',
    total: 8,
    hq: 4,
    site: 4,
    not_checked: 0,
    alertType: 'ok',
    iconClass: 'c5',
    sub_locations: [
      { name: '본사', count: 4, location: '본사' },
      { name: '현장', count: 4, location: '현장' },
    ],
  },
  {
    company: 'NONE',
    role: 'MECH',
    total: 5,
    hq: 0,
    site: 5,
    not_checked: 1,
    alertType: 'warning',
    iconClass: 'c6',
    sub_locations: [
      { name: '미분류', count: 5, location: '현장' },
    ],
  },
  {
    company: 'P&S',
    role: 'ELEC',
    total: 4,
    hq: 0,
    site: 4,
    not_checked: 0,
    alertType: 'ok',
    iconClass: 'c7',
    sub_locations: [
      { name: '현장', count: 4, location: '현장' },
    ],
  },
];

const KOREAN_NAMES: Record<string, string[]> = {
  'C&A': ['탁재훈', '어재훈', '팽현숙', '사공민', '독고준', '인재원', '사재훈', '김민호', '이지훈', '박서준', '최동현', '정민재', '강현우', '윤시우', '조재원', '권민준', '황인호', '안재현', '전민규', '류성훈', '남궁민', '신태양'],
  'FNI': ['김민준', '이서준', '박지호', '최현우', '정도윤', '강시우', '윤주원', '조민석', '권형준', '황성현', '안준호', '전재원', '류민준', '남성훈', '신민호', '오재원', '서현우', '한지민', '문상호', '성우진', '엄기준', '채민준'],
  'BAT': ['임태양', '한지민', '오성현', '서유진', '신재원', '홍길동', '문상호', '배수현', '구태영', '노민수', '진상현', '정우진', '변창우', '석진호', '유재석', '방성훈', '공민재', '편성근', '함지훈', '한재원'],
  'TMS(E)': ['배수현', '구태영', '노민수', '진상현', '성우진', '엄기준', '채민준', '함지훈', '김재원', '이민호', '박현준', '최재훈', '정성현', '강민준', '윤재원', '조현우', '황민재'],
  'TMS(M)': ['조민석', '권형준', '황인호', '안재현', '전민규', '류성훈', '남궁민', '신재훈'],
  'NONE': ['김미분류', '이미분류', '박미분류', '최미분류', '정미분류'],
  'P&S': ['변창우', '석진호', '유재석', '방성훈'],
};

let _extendedMockCache: ExtendedDailyAttendanceResponse | null = null;

export function getMockExtendedAttendance(): ExtendedDailyAttendanceResponse {
  if (_extendedMockCache) return _extendedMockCache;

  const dateStr = todayStr();
  const records: ExtendedAttendanceRecord[] = [];
  let workerId = 1;

  for (const companyData of MOCK_COMPANIES) {
    const names = KOREAN_NAMES[companyData.company] || [];
    const total = companyData.total;
    const notCheckedCount = companyData.not_checked;

    // Assign sub-locations to workers
    const subLocationAssignments: Array<{ name: string; location: '본사' | '현장' }> = [];
    for (const sub of companyData.sub_locations) {
      for (let i = 0; i < sub.count; i++) {
        subLocationAssignments.push({ name: sub.name, location: sub.location });
      }
    }

    for (let i = 0; i < total; i++) {
      const name = names[i] || `${companyData.company} 작업자 #${i + 1}`;
      const subLoc = subLocationAssignments[i] || { name: '현장', location: '현장' as const };
      let status: AttendanceRecord['status'];
      let check_in_time: string | null = null;
      let check_out_time: string | null = null;

      if (i >= total - notCheckedCount) {
        // 마지막 notCheckedCount명은 미체크
        status = 'not_checked';
      } else {
        // 출근한 인원 중 일부는 퇴근 완료, 나머지는 근무중
        const leftRatio = 0.4;
        const leftCount = Math.floor((total - notCheckedCount) * leftRatio);
        if (i < leftCount) {
          status = 'left';
          const inMins = 7 * 60 + 30 + Math.floor((i * 7) % 60);
          const outMins = 17 * 60 + Math.floor((i * 11) % 60);
          check_in_time = makeKSTTime(dateStr, Math.floor(inMins / 60), inMins % 60);
          check_out_time = makeKSTTime(dateStr, Math.floor(outMins / 60), outMins % 60);
        } else {
          status = 'working';
          const inMins = 7 * 60 + 30 + Math.floor((i * 7) % 60);
          check_in_time = makeKSTTime(dateStr, Math.floor(inMins / 60), inMins % 60);
        }
      }

      records.push({
        worker_id: workerId++,
        worker_name: name,
        company: companyData.company,
        role: companyData.role,
        check_in_time,
        check_out_time,
        status,
        work_site: subLoc.location === '본사' ? '본사' : '현장',
        product_line: subLoc.name,
        location: subLoc.location,
        sub_location: subLoc.name,
      });
    }
  }

  const checkedIn = records.filter((r) => r.status !== 'not_checked').length;
  const checkedOut = records.filter((r) => r.status === 'left').length;
  const currentlyWorking = records.filter((r) => r.status === 'working').length;
  const notChecked = records.filter((r) => r.status === 'not_checked').length;
  const hqCount = records.filter((r) => r.location === '본사').length;
  const siteCount = records.filter((r) => r.location === '현장').length;

  _extendedMockCache = {
    date: dateStr,
    records,
    summary: {
      total_registered: records.length,
      checked_in: checkedIn,
      checked_out: checkedOut,
      currently_working: currentlyWorking,
      not_checked: notChecked,
      hq_count: hqCount,
      site_count: siteCount,
      avg_attendance_rate: 87.8,
    },
  };

  return _extendedMockCache;
}

export function getMockTodayAttendance(): DailyAttendanceResponse {
  const extended = getMockExtendedAttendance();
  return {
    date: extended.date,
    records: extended.records,
    summary: {
      total_registered: extended.summary.total_registered,
      checked_in: extended.summary.checked_in,
      checked_out: extended.summary.checked_out,
      currently_working: extended.summary.currently_working,
      not_checked: extended.summary.not_checked,
    },
  };
}

export function getMockCompanySummary(): CompanySummaryResponse {
  const dateStr = todayStr();
  const by_company = MOCK_COMPANIES.map((c) => ({
    company: c.company,
    total_workers: c.total,
    checked_in: c.total - c.not_checked,
    checked_out: Math.floor((c.total - c.not_checked) * 0.4),
    currently_working: Math.ceil((c.total - c.not_checked) * 0.6),
    not_checked: c.not_checked,
  }));

  return { date: dateStr, by_company };
}

export { MOCK_COMPANIES };
