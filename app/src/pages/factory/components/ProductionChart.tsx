// src/pages/factory/components/ProductionChart.tsx
// Sprint 35 — 주간/월간 모델별 생산 지표 막대 차트 (기존 FactoryDashboardPage에서 추출)

import type { WeeklyKpiResponse, MonthlyDetailResponse } from '@/api/factory';

export interface ProductionChartProps {
  period: 'weekly' | 'monthly';
  weekly?: WeeklyKpiResponse;
  monthlyDetail?: MonthlyDetailResponse; // 월간 차트는 monthly-detail.by_model 재활용
  isLoading?: boolean;
}

export default function ProductionChart({ period, weekly, monthlyDetail, isLoading }: ProductionChartProps) {
  const chartData = period === 'weekly'
    ? (weekly?.by_model ?? [])
    : (monthlyDetail?.by_model ?? []);

  const maxCount = Math.max(...chartData.map(c => c.count), 1);

  const title = period === 'weekly' ? '주간 생산 지표' : '월간 생산 지표';
  const sub = '모델별 생산량';
  // 주간: BE weekly-kpi 기준 (현재 ship_plan_date → Sprint 62-BE 배포 후 기준 변경 가능성)
  // 월간: monthly-detail mech_start 기준 (영구 유지, v1.34.4 결정)

  return (
    <div style={{
      background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
      boxShadow: 'var(--shadow-card)', padding: '24px',
    }}>
      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)', marginBottom: '4px' }}>
        {title}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginBottom: '24px' }}>{sub}</div>
      {chartData.length > 0 ? (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '180px' }}>
          {chartData.map(c => (
            <div key={c.model} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gx-charcoal)', fontFamily: "'JetBrains Mono', monospace" }}>{c.count}</span>
              <div style={{
                width: '100%', maxWidth: '48px',
                height: `${Math.max((c.count / maxCount) * 150, 4)}px`,
                background: c.count === 0
                  ? 'linear-gradient(180deg, var(--gx-mist) 0%, #D1D5E0 100%)'
                  : 'linear-gradient(180deg, var(--gx-accent) 0%, #818CF8 100%)',
                borderRadius: '6px 6px 2px 2px',
                opacity: c.count === 0 ? 0.5 : 1,
              }} />
              <span style={{ fontSize: '9px', color: 'var(--gx-steel)', textAlign: 'center', lineHeight: 1.2 }}>{c.model}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gx-steel)', fontSize: '13px' }}>
          {isLoading ? '로딩 중...' : '데이터 없음'}
        </div>
      )}
    </div>
  );
}
