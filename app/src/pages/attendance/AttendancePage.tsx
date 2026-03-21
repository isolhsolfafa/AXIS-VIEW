// src/pages/attendance/AttendancePage.tsx
// 협력사 출퇴근 대시보드 — 컨셉 HTML 완전 적용

import { useState, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import Layout from '@/components/layout/Layout';
import StatusBar from '@/components/attendance/StatusBar';
import KpiCards from '@/components/attendance/KpiCards';
import ChartSection from '@/components/attendance/ChartSection';
import CompanySummaryCards from '@/components/attendance/CompanySummaryCards';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import BottomGrid from '@/components/attendance/BottomGrid';
import FilterBar from '@/components/attendance/FilterBar';
import { useAttendanceToday, useAttendanceSummary } from '@/hooks/useAttendance';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/store/authStore';
import type { AttendanceRecord } from '@/types/attendance';

type StatusFilter = 'all' | 'working' | 'left' | 'not_checked';
type ViewMode = 'card' | 'table';

export default function AttendancePage() {
  const { user } = useAuth();
  const isAdminOrGst = user?.is_admin || user?.company === 'GST';

  const today = format(new Date(), 'yyyy-MM-dd');
  // 협력사 유저는 자사 고정, admin/GST는 전체 선택 가능
  const [selectedCompany, setSelectedCompany] = useState(
    isAdminOrGst ? '전체' : (user?.company ?? '전체')
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { settings, updateSetting } = useSettings();
  const [viewMode, setViewMode] = useState<ViewMode>(settings.defaultView);

  const { data: attendanceData, dataUpdatedAt } = useAttendanceToday(
    selectedDate !== today ? selectedDate : undefined
  );
  const { data: summaryData } = useAttendanceSummary();

  // 어제 출근율 비교용 데이터 조회
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const { data: yesterdayData } = useAttendanceToday(yesterday);

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  const filteredRecords = useMemo<AttendanceRecord[]>(() => {
    let records = attendanceData?.records ?? [];
    // 협력사 유저: 자사 데이터만 (드롭다운 우회 방지)
    if (!isAdminOrGst && user?.company) {
      records = records.filter((r) => r.company === user.company);
    } else if (selectedCompany !== '전체') {
      records = records.filter((r) => r.company === selectedCompany);
    }
    if (statusFilter !== 'all') records = records.filter((r) => r.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      records = records.filter((r) => r.worker_name.toLowerCase().includes(q));
    }
    return records;
  }, [attendanceData, selectedCompany, statusFilter, searchQuery, isAdminOrGst, user?.company]);

  const summary = attendanceData?.summary;
  const allRecords = attendanceData?.records ?? [];
  const companies = summaryData?.by_company ?? [];

  // 실제 출근한 레코드만 (not_checked 제외 — work_site=null이므로 집계 대상 아님)
  const checkedInRecords = useMemo(
    () => allRecords.filter((r) => r.status !== 'not_checked'),
    [allRecords]
  );

  // 퇴근 미체크 레코드 (출근했지만 퇴근을 안 찍은 사람)
  const noCheckoutRecords = useMemo(
    () => allRecords.filter((r) => r.status === 'working' && r.check_in_time && !r.check_out_time),
    [allRecords]
  );

  // 출입 인원 기반 본사/현장 집계 (출근한 사람만)
  const hqTotal = checkedInRecords.filter((r) => r.work_site === 'HQ').length;
  const siteTotal = checkedInRecords.filter((r) => r.work_site === 'GST').length;

  // 오늘 출입 협력사: 출근자가 1명 이상인 회사만 카운트
  const todayActiveCompanyCount = new Set(checkedInRecords.map((r) => r.company)).size;
  // 전체 등록 협력사 수
  const totalCompanyCount = companies.length || new Set(allRecords.map((r) => r.company)).size;

  const avgRate = summary && summary.total_registered > 0
    ? Math.round((summary.checked_in / summary.total_registered) * 1000) / 10
    : 0;

  // 어제 출근율 계산
  const yesterdaySummary = yesterdayData?.summary;
  const yesterdayRate = yesterdaySummary && yesterdaySummary.total_registered > 0
    ? Math.round((yesterdaySummary.checked_in / yesterdaySummary.total_registered) * 1000) / 10
    : null;

  // Enhanced KPI summary
  const enhancedSummary = summary
    ? {
        ...summary,
        hq_count: hqTotal,
        site_count: siteTotal,
        avg_attendance_rate: avgRate,
        company_count: todayActiveCompanyCount,
        total_company_count: totalCompanyCount,
        no_checkout_count: noCheckoutRecords.length,
        yesterday_attendance_rate: yesterdayRate,
      }
    : null;

  // 차트 데이터: 회사별 본사/현장 인원 (출근한 사람만)
  const chartData = useMemo(() => {
    const map = new Map<string, { company: string; hq: number; site: number }>();
    for (const r of checkedInRecords) {
      if (!map.has(r.company)) map.set(r.company, { company: r.company, hq: 0, site: 0 });
      const entry = map.get(r.company)!;
      if (r.work_site === 'HQ') entry.hq++;
      else entry.site++;
    }
    return Array.from(map.values());
  }, [checkedInRecords]);

  // 회사별 본사/현장 breakdown (출근한 사람만)
  const companyBreakdown = useMemo(() => {
    const map = new Map<string, { hq: number; site: number }>();
    for (const r of checkedInRecords) {
      if (!map.has(r.company)) map.set(r.company, { hq: 0, site: 0 });
      const entry = map.get(r.company)!;
      if (r.work_site === 'HQ') entry.hq++;
      else entry.site++;
    }
    return map;
  }, [checkedInRecords]);

  // 회사별 퇴근 미체크 수 (출근했지만 퇴근 안 찍은 사람만)
  const companyNoCheckout = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of allRecords) {
      if (r.status === 'working' && r.check_in_time && !r.check_out_time) {
        map.set(r.company, (map.get(r.company) ?? 0) + 1);
      }
    }
    return map;
  }, [allRecords]);

  // CompanySummaryCards에 전달할 enriched 데이터
  const enrichedCompanies = useMemo(() => {
    return companies.map((c) => {
      const breakdown = companyBreakdown.get(c.company);
      const noCheckout = companyNoCheckout.get(c.company) ?? 0;
      return {
        ...c,
        hq_count: breakdown?.hq ?? 0,
        site_count: breakdown?.site ?? 0,
        not_checked: noCheckout,  // 퇴근 미체크만 카운트 (미출근 제외)
        alert_type: (noCheckout > 5 ? 'danger' : noCheckout > 0 ? 'warning' : 'ok') as 'danger' | 'warning' | 'ok',
      };
    });
  }, [companies, companyBreakdown, companyNoCheckout]);

  // 근무지 요약 (출근한 사람만)
  const locationSummaries = useMemo(() => {
    return Array.from(companyBreakdown.entries()).map(([company, b]) => ({
      company,
      hq: b.hq,
      site: b.site,
      total: b.hq + b.site,
    }));
  }, [companyBreakdown]);

  const handleViewChange = (v: ViewMode) => {
    setViewMode(v);
    updateSetting('defaultView', v);
  };

  return (
    <Layout
      title="협력사 대시보드"
      lastUpdated={lastUpdated}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
    >
      {/* E-1. Status Bar */}
      <div className="animate-in" style={{ animationDelay: '0.05s' }}>
        <StatusBar />
      </div>

      {/* E-2. KPI Cards */}
      {enhancedSummary && (
        <div className="animate-in" style={{ animationDelay: '0.1s' }}>
          <KpiCards summary={enhancedSummary} />
        </div>
      )}

      {/* E-3. Chart Section — 본사/현장 구분 설정에 따라 표시 */}
      {settings.showHqSiteBreakdown && (
        <div className="animate-in" style={{ animationDelay: '0.2s' }}>
          <ChartSection
            companies={chartData}
            hqTotal={hqTotal}
            siteTotal={siteTotal}
            notChecked={summary?.not_checked ?? 0}
          />
        </div>
      )}

      {/* E-4. Section Title + Company Cards */}
      <div className="animate-in" style={{ animationDelay: '0.25s', marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            background: 'var(--gx-white)',
            borderRadius: 'var(--radius-gx-lg)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
              협력사 상세 현황
            </div>
            <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>
              회사별 출입 인원 및 퇴근 체크 현황
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => handleViewChange('card')}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-gx-sm)',
                fontSize: '12px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                color: viewMode === 'card' ? 'var(--gx-accent)' : 'var(--gx-steel)',
                background: viewMode === 'card' ? 'var(--gx-accent-soft)' : 'transparent',
              }}
            >
              카드뷰
            </button>
            <button
              onClick={() => handleViewChange('table')}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-gx-sm)',
                fontSize: '12px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                color: viewMode === 'table' ? 'var(--gx-accent)' : 'var(--gx-steel)',
                background: viewMode === 'table' ? 'var(--gx-accent-soft)' : 'transparent',
              }}
            >
              테이블
            </button>
          </div>
        </div>
      </div>

      {/* E-5. Company Summary Cards (카드뷰일 때만) */}
      {viewMode === 'card' && enrichedCompanies.length > 0 && (
        <div className="animate-in" style={{ animationDelay: '0.3s' }}>
          <CompanySummaryCards companies={enrichedCompanies} />
        </div>
      )}

      {/* 테이블뷰일 때: 회사별 요약 테이블 */}
      {viewMode === 'table' && enrichedCompanies.length > 0 && (
        <div
          className="animate-in"
          style={{
            animationDelay: '0.3s',
            background: 'var(--gx-white)',
            borderRadius: 'var(--radius-gx-lg)',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
            marginBottom: '24px',
          }}
        >
          <AttendanceTable records={filteredRecords} />
        </div>
      )}

      {/* E-7. Bottom Grid (퇴근 미체크 + 근무지 요약) — 본사/현장 구분 설정에 따라 표시 */}
      {settings.showHqSiteBreakdown && (
        <div className="animate-in" style={{ animationDelay: '0.32s' }}>
          <BottomGrid
            notCheckedRecords={noCheckoutRecords}
            locationSummaries={locationSummaries}
          />
        </div>
      )}

      {/* E-6. 작업자 출퇴근 현황 — 필터 + 타이틀 + 테이블 통합 카드 */}
      <div
        className="animate-in"
        style={{
          animationDelay: '0.35s',
          background: 'var(--gx-white)',
          borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
          marginBottom: '24px',
        }}
      >
        {/* 섹션 타이틀 + 필터 통합 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid var(--gx-cloud)',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
              작업자 출퇴근 현황
            </div>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--gx-steel)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              전체 {filteredRecords.length}명 · 출근 {filteredRecords.filter(r => r.status !== 'not_checked').length}명
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <FilterBar
              selectedCompany={selectedCompany}
              onCompanyChange={setSelectedCompany}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              hideCompanyFilter={!isAdminOrGst}
            />
          </div>
        </div>

        {/* 테이블 */}
        <AttendanceTable records={filteredRecords} />
      </div>
    </Layout>
  );
}
