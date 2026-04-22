// src/pages/factory/components/KpiSwipeDeck.tsx
// Sprint 35 — 주간/월간 KPI 스와이프 덱 (4카드 × 2섹션)

import { useCallback, useEffect, useRef } from 'react';
import type { WeeklyKpiResponse, MonthlyKpiResponse } from '@/api/factory';
import KpiCard from './KpiCard';

export interface KpiSwipeDeckProps {
  period: 'weekly' | 'monthly';
  onPeriodChange: (p: 'weekly' | 'monthly') => void;
  weekly?: WeeklyKpiResponse;
  monthly?: MonthlyKpiResponse;
  weeklyLoading?: boolean;
  monthlyLoading?: boolean;
}

// TEMP-HARDCODE v1.34.3 (2026-04-22) — BE Sprint 62-BE 배포 후 제거
// 손님 응대용 임시 값 — 직접 SQL 집계 결과 반영
// 주간 생산량: BE weekly-kpi.production_count 값 유지 (하드코딩 없음)
// 주간 출하 (W17 2026-04-20~26): actual_ship_date 기준 = 11대
// 월간 (2026-04):           생산량 215대 / 출하 76대 (actual_ship_date)
const TEMP_WEEKLY_SHIPPED = 11;
const TEMP_MONTHLY_PRODUCTION = 215;
const TEMP_MONTHLY_SHIPPED = 76;

export default function KpiSwipeDeck({
  period, onPeriodChange, weekly, monthly, weeklyLoading, monthlyLoading,
}: KpiSwipeDeckProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 스와이프 → period state 싱크
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const next = scrollLeft / clientWidth > 0.5 ? 'monthly' : 'weekly';
    if (next !== period) onPeriodChange(next);
  }, [period, onPeriodChange]);

  // period state 외부 변경 → 스크롤 위치 싱크
  useEffect(() => {
    if (!scrollRef.current) return;
    const targetLeft = period === 'weekly' ? 0 : scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({ left: targetLeft, behavior: 'smooth' });
  }, [period]);

  const weekLabel = weekly ? `W${weekly.week} (${weekly.week_range.start.slice(5)} ~ ${weekly.week_range.end.slice(5)})` : '—';
  const monthLabel = monthly ? monthly.month : '—';
  const weeklySubtext = weekly ? `주간 값: ${weekly.completion_rate}% (W${weekly.week})` : undefined;

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Segment toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
        <button
          onClick={() => onPeriodChange('weekly')}
          aria-pressed={period === 'weekly'}
          style={{
            padding: '6px 14px', fontSize: '12px', fontWeight: 600,
            borderRadius: '6px', border: 'none', cursor: 'pointer',
            background: period === 'weekly' ? 'var(--gx-accent)' : 'var(--gx-mist)',
            color: period === 'weekly' ? 'var(--gx-white)' : 'var(--gx-steel)',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          주간
        </button>
        <button
          onClick={() => onPeriodChange('monthly')}
          aria-pressed={period === 'monthly'}
          style={{
            padding: '6px 14px', fontSize: '12px', fontWeight: 600,
            borderRadius: '6px', border: 'none', cursor: 'pointer',
            background: period === 'monthly' ? 'var(--gx-accent)' : 'var(--gx-mist)',
            color: period === 'monthly' ? 'var(--gx-white)' : 'var(--gx-steel)',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          월간
        </button>
        <span style={{ fontSize: '11px', color: 'var(--gx-steel)', marginLeft: 'auto' }}>
          ← 스와이프 또는 탭으로 전환 →
        </span>
      </div>

      {/* Scroll-snap 스와이프 덱 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          display: 'flex', overflowX: 'auto',
          scrollSnapType: 'x mandatory', scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
        }}
      >
        {/* 주간 섹션 */}
        <section style={{
          flexShrink: 0, width: '100%',
          scrollSnapAlign: 'start',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px',
        }}>
          <KpiCard
            label="주간 생산량"
            value={weekly?.production_count ?? '—'}
            unit="대"
            sub={weekLabel}
            color="var(--gx-info)"
            loading={weeklyLoading}
          />
          <KpiCard
            label="완료율"
            value={weekly?.completion_rate ?? '—'}
            unit="%"
            sub="공정 평균 완료율"
            color="var(--gx-success)"
            loading={weeklyLoading}
          />
          <KpiCard
            label="불량 건수"
            value={weekly?.defect_count ?? '—'}
            sub="QMS 연동 대기"
            color="var(--gx-danger)"
            loading={weeklyLoading}
          />
          <KpiCard
            label="출하 완료"
            value={TEMP_WEEKLY_SHIPPED /* actual_ship_date 기준 */}
            unit="대"
            sub="금주 실제 출하"
            color="var(--gx-accent)"
            loading={weeklyLoading}
          />
        </section>

        {/* 월간 섹션 */}
        <section style={{
          flexShrink: 0, width: '100%',
          scrollSnapAlign: 'start',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px',
        }}>
          <KpiCard
            label="월간 생산량"
            value={TEMP_MONTHLY_PRODUCTION /* ship_plan_date 기준 4월 계획 */}
            unit="대"
            sub={monthLabel}
            color="var(--gx-info)"
            loading={monthlyLoading}
          />
          {/* β': 메인 값 "—" + 서브텍스트로 주간 값 참고 */}
          <KpiCard
            label="완료율"
            value="—"
            sub="월간 기준 미산출"
            subtext={weeklySubtext}
            disabled
          />
          <KpiCard
            label="불량 건수"
            value={monthly?.defect_count ?? '—'}
            sub="QMS 연동 대기"
            color="var(--gx-danger)"
            loading={monthlyLoading}
          />
          <KpiCard
            label="출하 완료"
            value={TEMP_MONTHLY_SHIPPED /* actual_ship_date 기준 */}
            unit="대"
            sub="월간 실제 출하"
            color="var(--gx-accent)"
            loading={monthlyLoading}
          />
        </section>
      </div>

      {/* 점 indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: period === 'weekly' ? 'var(--gx-accent)' : 'var(--gx-silver)',
          transition: 'background 0.2s',
        }} />
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: period === 'monthly' ? 'var(--gx-accent)' : 'var(--gx-silver)',
          transition: 'background 0.2s',
        }} />
      </div>
    </div>
  );
}
