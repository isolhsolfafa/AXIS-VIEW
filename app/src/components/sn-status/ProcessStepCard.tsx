// src/components/sn-status/ProcessStepCard.tsx
// 공정별 상세 카드 — Sprint 18

import type { SNTaskDetail } from '@/types/snStatus';

interface ProcessStepCardProps {
  task: SNTaskDetail | null;
  displayLabel: string;
}

function formatTime(isoStr: string | null): string {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDuration(minutes: number | null): string {
  if (minutes == null) return '—';
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes}m`;
}

function taskStatus(task: SNTaskDetail | null): 'completed' | 'in_progress' | 'waiting' {
  if (!task || task.workers.length === 0) return 'waiting';
  if (task.workers.some(w => w.status === 'completed')) return 'completed';
  if (task.workers.some(w => w.status === 'in_progress')) return 'in_progress';
  return 'waiting';
}

const STATUS_CONFIG = {
  completed: { label: '✅', color: 'var(--gx-success)', bg: 'var(--gx-success-bg, rgba(16,185,129,0.08))' },
  in_progress: { label: '🔵', color: 'var(--gx-info)', bg: 'var(--gx-info-bg, rgba(59,130,246,0.08))' },
  waiting: { label: '○', color: 'var(--gx-silver)', bg: 'var(--gx-cloud)' },
};

export default function ProcessStepCard({ task, displayLabel }: ProcessStepCardProps) {
  const status = taskStatus(task);
  const cfg = STATUS_CONFIG[status];
  const workers = task?.workers ?? [];
  const isMultiWorker = workers.length >= 2;

  return (
    <div
      style={{
        background: 'var(--gx-white)',
        border: '1px solid var(--gx-mist)',
        borderRadius: 'var(--radius-gx-md, 10px)',
        padding: '14px 16px',
        transition: 'all 0.15s ease',
      }}
    >
      {/* 헤더: 공정명 + 상태 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: workers.length > 0 ? '10px' : '0' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
          {displayLabel}
        </span>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '10px',
            background: cfg.bg,
            color: cfg.color,
          }}
        >
          {cfg.label} {status === 'completed' ? '완료' : status === 'in_progress' ? '진행중' : '대기중'}
        </span>
      </div>

      {/* 작업자 목록 */}
      {workers.length === 0 && status === 'waiting' && (
        <div style={{ fontSize: '12px', color: 'var(--gx-silver)' }}>대기중</div>
      )}
      {workers.map((w, i) => (
        <div
          key={`${w.worker_id}-${i}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 0',
            borderTop: i > 0 ? '1px solid var(--gx-cloud)' : 'none',
            fontSize: '12px',
          }}
        >
          <span style={{ color: 'var(--gx-slate)', fontWeight: 500, minWidth: '56px' }}>
            👤 {w.worker_name}
          </span>
          <span style={{ color: 'var(--gx-steel)', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>
            {formatTime(w.started_at)} → {w.completed_at ? formatTime(w.completed_at) : '진행중'}
          </span>
          <span style={{ color: 'var(--gx-steel)', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', marginLeft: 'auto' }}>
            {formatDuration(w.duration_minutes)}
          </span>
          {isMultiWorker && i === 0 && (
            <span
              style={{
                fontSize: '9px',
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: '8px',
                background: 'var(--gx-info-bg, rgba(59,130,246,0.08))',
                color: 'var(--gx-info)',
                flexShrink: 0,
              }}
            >
              동시작업
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
