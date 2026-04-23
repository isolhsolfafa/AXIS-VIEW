// src/pages/factory/components/KpiSwipeDeck.tsx
// Sprint 35 — 주간/월간 KPI 스와이프 덱 (4카드 × 2섹션)
// v1.34.6 (2026-04-23): scroll-snap → transform: translateX 재설계
//   - 부모 레이아웃 overflow 영향 받지 않도록 overflow: hidden + translateX 토글
//   - 버튼 클릭 + 30초 자동 전환 확실히 동작
//   - 터치 스와이프 제스처는 Sprint 36 에서 swiper.js/embla-carousel 도입 시 추가

import { useEffect } from 'react';
import type { WeeklyKpiResponse, MonthlyKpiResponse } from '@/api/factory';
import KpiCard from './KpiCard';

// TEMP-HARDCODE v1.34.3 (2026-04-22) — BE Sprint 62-BE 배포 후 제거
// 손님 응대용 임시 값 — 직접 SQL 집계 결과 반영
// 주간 생산량: BE weekly-kpi.production_count 값 유지 (하드코딩 없음)
// 주간 출하 (W17 2026-04-20~26): actual_ship_date 기준 = 11대
// 월간 (2026-04):           생산량 215대 / 출하 76대 (actual_ship_date)
const TEMP_WEEKLY_SHIPPED = 11;
const TEMP_MONTHLY_PRODUCTION = 215;
const TEMP_MONTHLY_SHIPPED = 76;

export interface KpiSwipeDeckProps {
  period: 'weekly' | 'monthly';
  onPeriodChange: (p: 'weekly' | 'monthly') => void;
  weekly?: WeeklyKpiResponse;
  monthly?: MonthlyKpiResponse;
  weeklyLoading?: boolean;
  monthlyLoading?: boolean;
  autoSwipeInterval?: number;  // v1.34.5: 자동 전환 간격(ms). 0/undefined면 비활성
}

export default function KpiSwipeDeck({
  period, onPeriodChange, weekly, monthly, weeklyLoading, monthlyLoading,
  autoSwipeInterval,
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

  const sectionStyle: React.CSSProperties = {
    width: '50%',
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    padding: '0 2px',
    boxSizing: 'border-box',
  };

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
              value={TEMP_WEEKLY_SHIPPED /* actual_ship_date 기준 */}
              unit="대"
              sub="금주 실제 출하"
              color="var(--gx-accent)"
              loading={weeklyLoading}
            />
          </section>

          {/* 월간 섹션 */}
          <section style={sectionStyle}>
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
