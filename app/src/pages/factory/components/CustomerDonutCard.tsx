// src/pages/factory/components/CustomerDonutCard.tsx
// 공장 대시보드 우측 패널 — 월생산 고객사 비율 도넛 (Sprint 44, OPS #68 by_customer 연동)

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CustomerCount } from '@/api/factory';

const TEST_CUSTOMER = 'TEST CUSTOMER';
const TOP_N = 5;

// G-AXIS 토큰 — Top5 개별 색 + 기타(silver)
const DONUT_COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
const ETC_COLOR = '#B8BCC8';

export interface DonutSlice {
  customer: string;
  count: number;
  isEtc: boolean;
}

// 도넛 변환 (Sprint 44 영역 8 — 순서 고정):
// 1. by_customer (BE count DESC 정렬됨) → 2. TEST CUSTOMER 제거 → 3. 빈값 '(미지정)'
// → 4. Top5 + 기타(6번째 이하 합산, ≤5개면 기타 미생성) → 5. total = 표시 합 → 6. 재정렬 금지
export function buildDonutSlices(byCustomer: CustomerCount[]): { slices: DonutSlice[]; total: number } {
  const cleaned = byCustomer
    .filter(c => (c.customer ?? '').trim().toUpperCase() !== TEST_CUSTOMER)
    .map(c => ({ customer: (c.customer ?? '').trim() || '(미지정)', count: c.count }));

  const total = cleaned.reduce((s, c) => s + c.count, 0);

  if (cleaned.length <= TOP_N) {
    return { slices: cleaned.map(c => ({ ...c, isEtc: false })), total };
  }

  const top = cleaned.slice(0, TOP_N).map(c => ({ ...c, isEtc: false }));
  const etcCount = cleaned.slice(TOP_N).reduce((s, c) => s + c.count, 0);
  return {
    slices: [...top, { customer: '기타', count: etcCount, isEtc: true }],
    total,
  };
}

function sliceColor(slice: DonutSlice, index: number): string {
  return slice.isEtc ? ETC_COLOR : DONUT_COLORS[index % DONUT_COLORS.length];
}

export interface CustomerDonutCardProps {
  byCustomer?: CustomerCount[];
  isLoading?: boolean;
}

export default function CustomerDonutCard({ byCustomer, isLoading }: CustomerDonutCardProps) {
  const { slices, total } = byCustomer
    ? buildDonutSlices(byCustomer)
    : { slices: [] as DonutSlice[], total: 0 };

  // 빈 상태 메시지: undefined = BE 미배포 / [] = 월 데이터 0건
  const emptyMessage = isLoading
    ? '로딩 중...'
    : byCustomer === undefined
      ? '데이터 없음'
      : '월 생산 데이터 없음';

  return (
    <div style={{
      background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
      boxShadow: 'var(--shadow-card)', padding: '24px',
    }}>
      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)', marginBottom: '4px' }}>
        월생산 고객사 비율
      </div>
      <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginBottom: '20px' }}>
        이번 달 고객사별 생산 비중
      </div>

      {slices.length === 0 ? (
        <div style={{ height: '230px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gx-steel)', fontSize: '13px' }}>
          {emptyMessage}
        </div>
      ) : (
        <>
          {/* 도넛 + 중앙 총계 */}
          <div style={{ position: 'relative', height: '170px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="count"
                  nameKey="customer"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                  stroke="none"
                >
                  {slices.map((s, i) => (
                    <Cell key={s.customer} fill={sliceColor(s, i)} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${Number(value) || 0}대`, String(name)]}
                  contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid var(--gx-mist)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
            }}>
              <span style={{ fontSize: '24px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'var(--gx-charcoal)' }}>
                {total}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--gx-steel)' }}>총 생산 대수</span>
            </div>
          </div>

          {/* 범례 — 고객사명 + 대수 + % */}
          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {slices.map((s, i) => (
              <div key={s.customer} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: sliceColor(s, i), flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: 'var(--gx-slate)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.customer}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 600, color: 'var(--gx-graphite)' }}>
                  {s.count} ({total > 0 ? Math.round((s.count / total) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
