// src/components/sn-status/ProcessStepCard.tsx
// 공정별 상세 카드 — Sprint 18 + Sprint 20 체크리스트 확장

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import type { SNTaskDetail } from '@/types/snStatus';
import type { ChecklistStatusResponse } from '@/types/checklist';
import { useTaskReactivate } from '@/hooks/useTaskReactivate';

interface ProcessStepCardProps {
  task: SNTaskDetail | null;
  displayLabel: string;
  categoryPercent?: number;              // categories[cat].percent — 공정 완료 기준
  checklist?: ChecklistStatusResponse | null;
  checklistLoading?: boolean;
  canReactivate?: boolean;               // Sprint 23: 재활성화 버튼 표시 여부
}

function formatTime(isoStr: string | null): string {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${mm}/${dd} ${hh}:${mi}`;
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

function taskStatus(
  task: SNTaskDetail | null,
  categoryPercent?: number,
): 'completed' | 'in_progress' | 'waiting' {
  // 1순위: categories 데이터 기준 (BE 집계, SNCard와 동일 기준)
  if (categoryPercent != null) {
    if (categoryPercent === 100) return 'completed';
    if (categoryPercent > 0) return 'in_progress';
    return 'waiting';
  }
  // 2순위: fallback — categories 없는 edge case
  if (!task || task.workers.length === 0) return 'waiting';
  if (task.workers.every(w => w.status === 'completed')) return 'completed';
  if (task.workers.some(w => w.status === 'in_progress' || w.status === 'completed')) return 'in_progress';
  return 'waiting';
}

const STATUS_CONFIG = {
  completed: { label: '✅', color: 'var(--gx-success)', bg: 'var(--gx-success-bg, rgba(16,185,129,0.08))' },
  in_progress: { label: '🔵', color: 'var(--gx-info)', bg: 'var(--gx-info-bg, rgba(59,130,246,0.08))' },
  waiting: { label: '○', color: 'var(--gx-silver)', bg: 'var(--gx-cloud)' },
};

export default function ProcessStepCard({ task, displayLabel, categoryPercent, checklist, checklistLoading, canReactivate }: ProcessStepCardProps) {
  const status = taskStatus(task, categoryPercent);
  const cfg = STATUS_CONFIG[status];
  const workers = task?.workers ?? [];
  const isMultiWorker = workers.length >= 2;
  const hasChecklist = checklist && checklist.summary?.total_check > 0;
  const [checklistOpen, setChecklistOpen] = useState(false);
  const reactivate = useTaskReactivate();

  function handleReactivate(taskDetailId: number) {
    if (!confirm('이 작업을 재활성화하시겠습니까?\n실적확인이 취소됩니다.')) return;
    reactivate.mutate(taskDetailId, {
      onSuccess: (res) => {
        const count = res.data.confirms_invalidated;
        toast.success(`작업이 재활성화되었습니다.${count > 0 ? ` (실적확인 ${count}건 취소)` : ''}`);
      },
      onError: (err: any) => {
        const status = err?.response?.status;
        const fallback = status === 403
          ? '재활성화 권한이 없습니다.'
          : status === 404
            ? '해당 작업을 찾을 수 없습니다.'
            : status >= 500
              ? '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
              : '재활성화에 실패했습니다.';
        toast.error(fallback);
      },
    });
  }

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: workers.length > 0 || hasChecklist ? '10px' : '0' }}>
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
      {workers.length === 0 && status === 'waiting' && !hasChecklist && (
        <div style={{ fontSize: '12px', color: 'var(--gx-silver)' }}>대기중</div>
      )}
      {workers.length > 0 && (
        <div style={{ marginBottom: hasChecklist ? '10px' : '0' }}>
          {[...workers].sort((a, b) => {
            // 1차: task_name 그룹핑 (알파벳순)
            const nameA = a.task_name ?? '';
            const nameB = b.task_name ?? '';
            if (nameA !== nameB) return nameA.localeCompare(nameB);
            // 2차: 같은 task 내에서 최신순
            const ta = a.started_at ? new Date(a.started_at).getTime() : 0;
            const tb = b.started_at ? new Date(b.started_at).getTime() : 0;
            return tb - ta;
          }).map((w, i) => (
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
                {w.task_name && (
                  <span style={{ color: 'var(--gx-silver)', fontWeight: 400, fontSize: '10px', marginLeft: '4px' }}>
                    {w.task_name}
                  </span>
                )}
              </span>
              <span style={{ color: 'var(--gx-steel)', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>
                {formatTime(w.started_at)} → {w.completed_at ? formatTime(w.completed_at) : '진행중'}
              </span>
              <span style={{ color: 'var(--gx-steel)', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', marginLeft: 'auto' }}>
                {formatDuration(w.duration_minutes)}
              </span>
              {w.completed_at && canReactivate && w.task_detail_id && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleReactivate(w.task_detail_id!); }}
                  disabled={reactivate.isPending}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: reactivate.isPending ? 'not-allowed' : 'pointer',
                    padding: '2px',
                    color: 'var(--gx-silver)',
                    transition: 'color 0.15s',
                    flexShrink: 0,
                    opacity: reactivate.isPending ? 0.4 : 1,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--gx-warning)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--gx-silver)'; }}
                  title="작업 재활성화"
                >
                  <RotateCcw size={13} />
                </button>
              )}
              {isMultiWorker && i === workers.length - 1 && (
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
      )}

      {/* 체크리스트 섹션 — Sprint 20 */}
      {checklistLoading && (
        <div style={{
          padding: '8px 0', fontSize: '11px', color: 'var(--gx-steel)',
          borderTop: workers.length > 0 ? '1px solid var(--gx-cloud)' : 'none',
        }}>
          체크리스트 로딩 중...
        </div>
      )}
      {hasChecklist && (
        <div style={{
          borderTop: workers.length > 0 ? '1px solid var(--gx-cloud)' : 'none',
          paddingTop: '10px',
        }}>
          {/* 요약 — 클릭 시 상세 토글 */}
          <div
            onClick={() => setChecklistOpen(!checklistOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: checklistOpen ? '6px' : '0',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
              {checklistOpen ? '▼' : '▶'} 체크리스트
            </span>
            <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: checklist.summary?.percent === 100 ? 'var(--gx-success)' : 'var(--gx-slate)' }}>
              {checklist.summary?.completed ?? 0} / {checklist.summary?.total_check ?? 0} 완료
            </span>
            {!checklistOpen && (
              <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'var(--gx-cloud)', overflow: 'hidden', marginLeft: '4px' }}>
                <div style={{
                  height: '100%', width: `${checklist.summary?.percent ?? 0}%`, borderRadius: '2px',
                  background: checklist.summary?.percent === 100 ? 'var(--gx-success)' : 'var(--gx-accent)',
                }} />
              </div>
            )}
          </div>

          {checklistOpen && (
            <>
              {/* 프로그레스 바 */}
              <div style={{ height: '5px', borderRadius: '3px', background: 'var(--gx-cloud)', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{
                  height: '100%', width: `${checklist.summary.percent}%`, borderRadius: '3px',
                  background: checklist.summary.percent === 100 ? 'var(--gx-success)' : 'var(--gx-accent)',
                  transition: 'width 0.3s ease',
                }} />
              </div>

              {/* 미완료 항목 */}
              {checklist.summary.percent < 100 && (() => {
                const incomplete = checklist.items.filter(i => i.item_type === 'CHECK' && !i.record);
                if (incomplete.length === 0) return null;
                return (
                  <div style={{ fontSize: '11px', color: 'var(--gx-steel)' }}>
                    <div style={{ marginBottom: '4px', fontWeight: 500 }}>미완료 항목:</div>
                    {incomplete.slice(0, 5).map(i => (
                      <div key={i.master_id} style={{ padding: '2px 0', display: 'flex', gap: '4px' }}>
                        <span style={{ color: 'var(--gx-silver)' }}>○</span>
                        <span>{i.item_group} — {i.item_name}</span>
                      </div>
                    ))}
                    {incomplete.length > 5 && (
                      <div style={{ padding: '2px 0', color: 'var(--gx-silver)' }}>
                        외 {incomplete.length - 5}개 항목
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
}
