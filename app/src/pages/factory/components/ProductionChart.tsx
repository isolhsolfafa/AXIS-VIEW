// src/pages/factory/components/ProductionChart.tsx
// Sprint 35 — 주간/월간 모델별 생산 지표 막대 차트 (기존 FactoryDashboardPage에서 추출)
// 2026-05-14 옵션 E: 카드 flex column + 차트 영역 동적 stretch (옆 CustomerDonutCard height 매칭) + 라벨 ellipsis + tooltip
//   - 빈 공간(약 162px) 활용 — 월간 뷰 도넛+범례 카드 length 에 맞춰 자동 stretch
//   - 라벨 baseline 정렬 통일 (single-line + ellipsis) — 긴 모델명은 hover tooltip

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
      display: 'flex', flexDirection: 'column',  // 옵션 B — 카드 전체 flex column → 차트 영역 stretch 가능
    }}>
      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)', marginBottom: '4px' }}>
        {title}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginBottom: '24px' }}>{sub}</div>
      {chartData.length > 0 ? (
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: '12px',
          flex: 1,                  // 옵션 B — 옆 카드 height 에 자동 stretch
          minHeight: '180px',       // 주간 뷰(StageCompletionCard) 시 최소 height 보장
        }}>
          {chartData.map(c => (
            <div key={c.model} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '6px',
              height: '100%',              // 컬럼이 차트 영역 전체 채움
              justifyContent: 'flex-end',  // 막대 바닥 정렬 base
              minWidth: 0,                 // flex item 안 ellipsis 동작 필수
            }}>
              {/* 막대 wrapper — count 가 막대 바로 위에 붙어 막대 높이를 따라감 (2026-05-18 #3) */}
              <div style={{
                flex: 1, width: '100%', maxWidth: '48px',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'flex-end', alignItems: 'center',
                minHeight: 0,
              }}>
                <span style={{
                  fontSize: '12px', fontWeight: 600, color: 'var(--gx-charcoal)',
                  fontFamily: "'JetBrains Mono', monospace",
                  flexShrink: 0, marginBottom: '3px',
                }}>{c.count}</span>
                <div style={{
                  width: '100%',
                  height: `${Math.max((c.count / maxCount) * 100, 2)}%`,
                  background: c.count === 0
                    ? 'linear-gradient(180deg, var(--gx-mist) 0%, #D1D5E0 100%)'
                    : 'linear-gradient(180deg, var(--gx-accent) 0%, #818CF8 100%)',
                  borderRadius: '6px 6px 2px 2px',
                  opacity: c.count === 0 ? 0.5 : 1,
                }} />
              </div>
              {/* 라벨 — single-line + ellipsis + hover tooltip (옵션 C) */}
              <span
                style={{
                  fontSize: '9px', color: 'var(--gx-steel)',
                  textAlign: 'center', lineHeight: 1.2,
                  maxWidth: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={c.model}
              >
                {c.model}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gx-steel)', fontSize: '13px' }}>
          {isLoading ? '로딩 중...' : '데이터 없음'}
        </div>
      )}
    </div>
  );
}
