// src/components/sn-status/SNCard.tsx
// S/N 카드 컴포넌트 — Sprint 18

import type { SNProduct } from '@/types/snStatus';
import { PROCESS_ORDER, TAB_LABEL } from './constants';
import { maskName } from '@/utils/format';

interface SNCardProps {
  product: SNProduct;
  isSelected: boolean;
  onClick: (serialNumber: string) => void;
}

function statusIcon(percent: number | undefined) {
  if (percent == null) return null;
  if (percent === 100) return <span style={{ color: 'var(--gx-success)' }}>✓</span>;
  if (percent > 0) return <span style={{ color: 'var(--gx-info)' }}>●</span>;
  return <span style={{ color: 'var(--gx-silver)' }}>○</span>;
}

function formatActivityTime(isoStr: string | null): string {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hh}:${mm}`;
}

export default function SNCard({ product, isSelected, onClick }: SNCardProps) {
  const { serial_number, model, overall_percent, categories, all_completed, all_completed_at, last_worker, last_activity_at, last_task_name } = product;

  return (
    <div
      onClick={() => onClick(serial_number)}
      style={{
        background: 'var(--gx-white)',
        borderRadius: 'var(--radius-gx-md, 10px)',
        padding: '18px',
        cursor: 'pointer',
        border: isSelected ? '2px solid var(--gx-accent)' : '1px solid var(--gx-mist)',
        boxShadow: isSelected
          ? '0 0 0 3px rgba(99,102,241,0.12)'
          : '0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* 헤더: S/N + 모델 */}
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)', fontFamily: "'JetBrains Mono', monospace" }}>
          {serial_number}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--gx-steel)', marginTop: '2px' }}>
          {model}
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--gx-steel)' }}>진행률</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: all_completed ? 'var(--gx-success)' : 'var(--gx-charcoal)', fontFamily: "'JetBrains Mono', monospace" }}>
            {overall_percent}%
          </span>
        </div>
        <div style={{ height: '6px', borderRadius: '3px', background: 'var(--gx-cloud)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${overall_percent}%`,
              borderRadius: '3px',
              background: all_completed
                ? 'var(--gx-success)'
                : overall_percent > 0
                  ? 'var(--gx-accent)'
                  : 'transparent',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* 공정 아이콘 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px 8px' }}>
        {PROCESS_ORDER.map((cat) => {
          const catData = categories[cat];
          if (!catData) return null;
          return (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
              {statusIcon(catData.percent)}
              <span style={{ color: 'var(--gx-slate)', fontWeight: 500 }}>{TAB_LABEL[cat]}</span>
            </div>
          );
        })}
      </div>

      {/* 하단: 최근 작업자 or 완료 */}
      <div style={{ fontSize: '11px', color: 'var(--gx-steel)', minHeight: '16px' }}>
        {all_completed ? (
          <span style={{ color: 'var(--gx-success)', fontWeight: 600 }}>
            ✅ 완료 {all_completed_at ? formatActivityTime(all_completed_at) : ''}
          </span>
        ) : last_worker ? (
          <span>
            {maskName(last_worker)}{last_task_name ? ` · ${last_task_name}` : ''} {last_activity_at ? formatActivityTime(last_activity_at) : ''}
          </span>
        ) : null}
      </div>
    </div>
  );
}
