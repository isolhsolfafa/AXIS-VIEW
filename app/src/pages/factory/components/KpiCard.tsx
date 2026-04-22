// src/pages/factory/components/KpiCard.tsx
// 공장 대시보드 KPI 카드 — Sprint 35 신규 (기존 FactoryDashboardPage 인라인 렌더 공용화)

import type { ReactNode } from 'react';

export interface KpiCardProps {
  label: string;
  value: ReactNode;       // 숫자 또는 "—"
  unit?: string;          // "대", "%" 등
  sub?: string;           // 서브 라인 (W14, 금주 출하 등)
  subtext?: string;       // β' 참고 텍스트 (주간 값 노출 등) — 있으면 서브 박스로 표시
  color?: string;         // 값 색상 (기본: --gx-charcoal)
  disabled?: boolean;     // β' 월간 완료율 dim
  loading?: boolean;
}

export default function KpiCard({
  label, value, unit, sub, subtext, color, disabled, loading,
}: KpiCardProps) {
  if (loading) {
    return (
      <div style={{
        background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
        padding: '20px 24px', boxShadow: 'var(--shadow-card)', height: '100px',
      }}>
        <div style={{ fontSize: '12px', color: 'var(--gx-steel)' }}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
      padding: '20px 24px', boxShadow: 'var(--shadow-card)',
      opacity: disabled ? 0.6 : 1,
    }}>
      <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-steel)', marginBottom: '12px' }}>
        {label}
      </div>
      <div style={{
        fontSize: '28px', fontWeight: 700, lineHeight: 1.1,
        color: color ?? 'var(--gx-charcoal)',
      }}>
        {value}
        {unit && <span style={{ fontSize: '16px', marginLeft: '4px' }}>{unit}</span>}
      </div>
      {sub && (
        <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '8px' }}>{sub}</div>
      )}
      {subtext && (
        <div style={{
          fontSize: '11px', marginTop: '8px', padding: '3px 8px',
          background: 'var(--gx-mist)', color: 'var(--gx-steel)',
          borderRadius: '6px', display: 'inline-block',
        }}>
          {subtext}
        </div>
      )}
    </div>
  );
}
