// src/components/attendance/StatusBar.tsx
// 실시간 동기화 상태 표시 바 — 컨셉 HTML 완전 적용

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function StatusBar() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = format(now, 'yyyy-MM-dd HH:mm');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: 'var(--gx-white)',
        borderRadius: 'var(--radius-gx-lg)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '24px',
      }}
    >
      {/* 좌측 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--gx-success)',
            animation: 'pulse 2s infinite',
            flexShrink: 0,
          }}
        />
        <div style={{ fontSize: '13px', color: 'var(--gx-slate)' }}>
          <strong style={{ color: 'var(--gx-charcoal)', fontWeight: 600 }}>
            출입 데이터 동기화 완료
          </strong>
          {' · '}
          일자별 독립 관리
        </div>
      </div>

      {/* 우측 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-gx-sm)',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--gx-accent)',
            background: 'var(--gx-accent-soft)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="10" height="9" rx="1.5"/>
            <path d="M2 6h10"/>
          </svg>
          일자별 독립 관리
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            color: 'var(--gx-steel)',
            background: 'var(--gx-cloud)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-gx-sm)',
          }}
        >
          {timeStr} KST
        </div>
      </div>
    </div>
  );
}
