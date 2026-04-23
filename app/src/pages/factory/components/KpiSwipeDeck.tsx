// src/pages/factory/components/KpiSwipeDeck.tsx
// Sprint 35 — 주간/월간 KPI 스와이프 덱 (4카드 × 2섹션)
// v1.34.6 (2026-04-23): scroll-snap → transform: translateX 재설계
// v1.35.0 Sprint 35 Phase 2 (2026-04-23): TEMP-HARDCODE 제거 + shippedBasis 토글 매핑

import { useEffect } from 'react';
import type { WeeklyKpiResponse, MonthlyKpiResponse, ShippedBasis } from '@/api/factory';
import KpiCard from './KpiCard';

export interface KpiSwipeDeckProps {
  period: 'weekly' | 'monthly';
  onPeriodChange: (p: 'weekly' | 'monthly') => void;
  weekly?: WeeklyKpiResponse;
  monthly?: MonthlyKpiResponse;
  weeklyLoading?: boolean;
  monthlyLoading?: boolean;
  autoSwipeInterval?: number;  // v1.34.5: 자동 전환 간격(ms). 0/undefined면 비활성
  shippedBasis?: ShippedBasis; // v1.35.0: 출하 완료 기준 (기본 'actual')
}

// BE v2.2 3필드 중 선택
function pickShipped(
  data: WeeklyKpiResponse | MonthlyKpiResponse | undefined,
  basis: ShippedBasis,
): number | undefined {
  if (!data) return undefined;
  if (basis === 'plan')   return data.shipped_plan;
  if (basis === 'ops')    return data.shipped_ops;
  return data.shipped_actual; // 기본 'actual'
}

export default function KpiSwipeDeck({
  period, onPeriodChange, weekly, monthly, weeklyLoading, monthlyLoading,
  autoSwipeInterval, shippedBasis = 'actual',
}: KpiSwipeDeckProps) {
  // v1.34.5: 30초 간격 자동 전환 (대형 모니터 운영 대응)
  useEffect(() => {
    if (!autoSwipeInterval || autoSwipeInterval <= 0) return;
    const timer = setInterval(() => {
      onPeriodChange(period === 'weekly' ? 'monthly' : 'weekly');
    }, autoSwipeInterval);
    return () => clearInterval(timer);
  }, [period, autoSwipeInterval, onPeriodChange]);

  const weekLabel = weekly ? `W${weekly.week} (${weekly.week_range.start.slice(5)} ~ ${weekly.week_range.end.slice(5)})` : '—';
  const monthLabel = monthly ? monthly.month : '—';
  const weeklySubtext = weekly ? `주간 값: ${weekly.completion_rate}% (W${weekly.week})` : undefined;

  // v1.35.0: shippedBasis 토글에 따라 3필드 중 선택
  const weeklyShipped  = pickShipped(weekly, shippedBasis);
  const monthlyShipped = pickShipped(monthly, shippedBasis);

  const sectionStyle: React.CSSProperties = {
    width: '50%',
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    padding: '0 2px',
    boxSizing: 'border-box',
  };

  const basisLabel = shippedBasis === 'plan' ? '계획' : shippedBasis === 'ops' ? '실시간' : '실적';

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
          탭 전환 또는 30초마다 자동 전환
        </span>
      </div>

      {/* v1.34.6: transform: translateX 기반 슬라이드 덱 */}
      <div style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          width: '200%',
          transform: period === 'weekly' ? 'translateX(0%)' : 'translateX(-50%)',
          transition: 'transform 0.4s ease',
        }}>
          {/* 주간 섹션 */}
          <section style={sectionStyle}>
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
              value={weeklyShipped ?? '—'}
              unit="대"
              sub={`금주 출하 (${basisLabel})`}
              color="var(--gx-accent)"
              loading={weeklyLoading}
            />
          </section>

          {/* 월간 섹션 */}
          <section style={sectionStyle}>
            <KpiCard
              label="월간 생산량"
              value={monthly?.production_count ?? '—'}
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
              value={monthlyShipped ?? '—'}
              unit="대"
              sub={`월간 출하 (${basisLabel})`}
              color="var(--gx-accent)"
              loading={monthlyLoading}
            />
          </section>
        </div>
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
