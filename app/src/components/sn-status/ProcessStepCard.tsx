// src/components/sn-status/ProcessStepCard.tsx
// 공정별 상세 카드 — Sprint 33 (강제종료 + 미시작 표시)

import { useState } from 'react';
import { RotateCcw, StopCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { SNTaskDetail } from '@/types/snStatus';
import type { ChecklistStatusResponse } from '@/types/checklist';
import { useTaskReactivate } from '@/hooks/useTaskReactivate';
import { useForceClose } from '@/hooks/useForceClose';
import { maskName, formatDateTime } from '@/utils/format';

interface ProcessStepCardProps {
  task: SNTaskDetail | null;
  displayLabel: string;
  categoryPercent?: number;
  checklist?: ChecklistStatusResponse | null;
  checklistLoading?: boolean;
  canReactivate?: boolean;
  canForceClose?: boolean;           // Sprint 33
  currentUserCompany?: string;       // Sprint 33: Manager 행 레벨 권한
  isAdmin?: boolean;                 // Sprint 33
  pendingBadges?: React.ReactNode;   // Sprint 33: 미종료/미시작 배지
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
  if (categoryPercent != null) {
    if (categoryPercent === 100) return 'completed';
    if (categoryPercent > 0) return 'in_progress';
    return 'waiting';
  }
  if (!task || task.workers.length === 0) {
    if (task?.force_closed) return 'completed';   // FE-19: 미시작 강제종료 케이스
    return 'waiting';
  }
  if (task.workers.every(w => w.status === 'completed')) return 'completed';
  if (task.workers.some(w => w.status === 'in_progress' || w.status === 'completed')) return 'in_progress';
  return 'waiting';
}

const STATUS_CONFIG = {
  completed: { label: '✅', color: 'var(--gx-success)', bg: 'var(--gx-success-bg, rgba(16,185,129,0.08))' },
  in_progress: { label: '🔵', color: 'var(--gx-info)', bg: 'var(--gx-info-bg, rgba(59,130,246,0.08))' },
  waiting: { label: '○', color: 'var(--gx-silver)', bg: 'var(--gx-cloud)' },
};

export default function ProcessStepCard({
  task, displayLabel, categoryPercent, checklist, checklistLoading,
  canReactivate, canForceClose, currentUserCompany, isAdmin, pendingBadges,
}: ProcessStepCardProps) {
  const status = taskStatus(task, categoryPercent);
  const cfg = STATUS_CONFIG[status];
  const workers = task?.workers ?? [];
  const isMultiWorker = workers.length >= 2;
  const hasChecklist = checklist && checklist.summary?.total_check > 0;
  const [checklistOpen, setChecklistOpen] = useState(false);
  const reactivate = useTaskReactivate();
  const forceClose = useForceClose();

  // 강제종료 모달 상태
  const [forceCloseTarget, setForceCloseTarget] = useState<{ taskDetailId: number; workerName: string } | null>(null);
  const [forceCloseReason, setForceCloseReason] = useState('');
  const [forceCloseTime, setForceCloseTime] = useState('');

  function handleReactivate(taskDetailId: number) {
    if (!confirm('이 작업을 재활성화하시겠습니까?\n실적확인이 취소됩니다.')) return;
    reactivate.mutate(taskDetailId, {
      onSuccess: (res) => {
        const count = res.data.confirms_invalidated;
        toast.success(`작업이 재활성화되었습니다.${count > 0 ? ` (실적확인 ${count}건 취소)` : ''}`);
      },
      onError: (err: any) => {
        const s = err?.response?.status;
        const msg = s === 403 ? '재활성화 권한이 없습니다.'
          : s === 404 ? '해당 작업을 찾을 수 없습니다.'
          : s >= 500 ? '서버에 일시적인 문제가 발생했습니다.'
          : '재활성화에 실패했습니다.';
        toast.error(msg);
      },
    });
  }

  function handleForceCloseSubmit() {
    if (!forceCloseTarget || !forceCloseReason.trim()) return;
    forceClose.mutate({
      taskId: forceCloseTarget.taskDetailId,
      reason: forceCloseReason.trim(),
      completedAt: forceCloseTime || undefined,
    }, {
      onSuccess: () => {
        toast.success('작업이 강제 종료되었습니다.');
        setForceCloseTarget(null);
        setForceCloseReason('');
        setForceCloseTime('');
      },
      onError: (err: any) => {
        const s = err?.response?.status;
        const msg = s === 403 ? '강제 종료 권한이 없습니다.'
          : s === 404 ? '해당 작업을 찾을 수 없습니다.'
          : '강제 종료에 실패했습니다.';
        toast.error(msg);
      },
    });
  }

  // 행 레벨 강제종료 가능 여부
  function canForceCloseWorker(workerCompany?: string | null): boolean {
    if (!canForceClose) return false;
    if (isAdmin) return true;
    // Manager: 본인 회사 task만
    return !!currentUserCompany && workerCompany === currentUserCompany;
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
      {/* 헤더: 공정명 + 상태 + 배지 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: workers.length > 0 || hasChecklist ? '10px' : '0', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
            {displayLabel}
          </span>
          {/* 강제종료 뱃지 */}
          {task?.force_closed && (
            <span style={{
              fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '8px',
              background: 'rgba(239,68,68,0.1)', color: 'var(--gx-danger)',
            }}>
              🔒 강제종료
            </span>
          )}
          {/* 미종료/미시작 배지 */}
          {pendingBadges}
        </div>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '10px',
            background: cfg.bg,
            color: cfg.color,
            flexShrink: 0,
          }}
        >
          {cfg.label} {status === 'completed' ? '완료' : status === 'in_progress' ? '진행중' : '대기중'}
        </span>
      </div>

      {/* 작업자 목록 — workers=[] 경로: SNDetailPanel이 placeholder worker 주입하므로 일반적으로 도달하지 않음 (방어적 fallback) */}
      {workers.length === 0 && !hasChecklist && (
        <div style={{ fontSize: '12px', color: 'var(--gx-silver)' }}>대기중</div>
      )}
      {workers.length > 0 && (
        <div style={{ marginBottom: hasChecklist ? '10px' : '0' }}>
          {[...workers].sort((a, b) => {
            const nameA = a.task_name ?? '';
            const nameB = b.task_name ?? '';
            if (nameA !== nameB) return nameA.localeCompare(nameB);
            const ta = a.started_at ? new Date(a.started_at).getTime() : 0;
            const tb = b.started_at ? new Date(b.started_at).getTime() : 0;
            return tb - ta;
          }).map((w, i) => {
            // status 정규화: 'not_started' → 'waiting' 매핑
            const displayStatus = w.status === 'not_started' ? 'waiting' : w.status;
            const isOverdue = w.started_at && !w.completed_at &&
              ((Date.now() - new Date(w.started_at).getTime()) / (1000 * 60 * 60) > 14);

            return (
              <div
                key={`${w.worker_id}-${i}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 0',
                  borderTop: i > 0 ? '1px solid var(--gx-cloud)' : 'none',
                  fontSize: '12px',
                  // 미시작 row 배경
                  ...(displayStatus === 'waiting' ? { background: 'rgba(245,158,11,0.04)', borderRadius: '4px', padding: '6px 4px' } : {}),
                }}
              >
                <span style={{ color: 'var(--gx-slate)', fontWeight: 500, minWidth: '56px' }}>
                  👤 {maskName(w.worker_name)}
                  {w.task_name && (
                    <span style={{ color: 'var(--gx-silver)', fontWeight: 400, fontSize: '10px', marginLeft: '4px' }}>
                      {w.task_name}
                    </span>
                  )}
                </span>
                <span
                  className={w.force_closed ? 'fc-tooltip' : undefined}
                  data-tooltip={w.force_closed
                    ? `사유: ${w.close_reason ?? '—'}\n처리: ${w.closed_by_name ? maskName(w.closed_by_name) : '—'}\n종료: ${w.force_closed_at ? formatDateTime(w.force_closed_at) : '—'}`
                    : undefined}
                  style={{
                    color: (w.force_closed || isOverdue) ? 'var(--gx-danger)' : 'var(--gx-steel)',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '11px',
                    fontWeight: (w.force_closed || isOverdue) ? 600 : 400,
                    cursor: w.force_closed ? 'help' : 'default',
                  }}
                >
                  {w.force_closed
                    ? `🔒 강제종료${w.force_closed_at ? ' ' + formatTime(w.force_closed_at) : ''}`
                    : (displayStatus === 'waiting'
                        ? '미시작'
                        : `${formatTime(w.started_at)} → ${w.completed_at ? formatTime(w.completed_at) : '진행중'}`)
                  }
                </span>
                <span style={{ color: 'var(--gx-steel)', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', marginLeft: 'auto' }}>
                  {(w.force_closed || displayStatus === 'waiting') ? '—' : formatDuration(w.duration_minutes)}
                </span>
                {/* 재활성화 버튼 */}
                {w.completed_at && canReactivate && w.task_detail_id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReactivate(w.task_detail_id!); }}
                    disabled={reactivate.isPending}
                    style={{
                      background: 'none', border: 'none',
                      cursor: reactivate.isPending ? 'not-allowed' : 'pointer',
                      padding: '2px', color: 'var(--gx-silver)',
                      transition: 'color 0.15s', flexShrink: 0,
                      opacity: reactivate.isPending ? 0.4 : 1,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--gx-warning)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--gx-silver)'; }}
                    title="작업 재활성화"
                  >
                    <RotateCcw size={13} />
                  </button>
                )}
                {/* 강제종료 버튼 — completed_at 없고 권한 있을 때 (이미 force_closed면 숨김) */}
                {!w.completed_at && !w.force_closed && w.task_detail_id && canForceCloseWorker(w.company) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setForceCloseTarget({ taskDetailId: w.task_detail_id!, workerName: w.worker_name });
                    }}
                    style={{
                      background: 'none', border: 'none',
                      cursor: 'pointer', padding: '2px',
                      color: 'var(--gx-silver)', transition: 'color 0.15s', flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--gx-danger)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--gx-silver)'; }}
                    title="강제 종료"
                  >
                    <StopCircle size={13} />
                  </button>
                )}
                {isMultiWorker && i === workers.length - 1 && (
                  <span
                    style={{
                      fontSize: '9px', fontWeight: 600, padding: '1px 6px', borderRadius: '8px',
                      background: 'var(--gx-info-bg, rgba(59,130,246,0.08))', color: 'var(--gx-info)',
                      flexShrink: 0,
                    }}
                  >
                    동시작업
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 체크리스트 섹션 */}
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
          <div
            onClick={() => setChecklistOpen(!checklistOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: checklistOpen ? '6px' : '0',
              cursor: 'pointer', userSelect: 'none',
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
              <div style={{ height: '5px', borderRadius: '3px', background: 'var(--gx-cloud)', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{
                  height: '100%', width: `${checklist.summary.percent}%`, borderRadius: '3px',
                  background: checklist.summary.percent === 100 ? 'var(--gx-success)' : 'var(--gx-accent)',
                  transition: 'width 0.3s ease',
                }} />
              </div>
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

      {/* 강제종료 모달 */}
      {forceCloseTarget && (
        <div
          onClick={() => { setForceCloseTarget(null); setForceCloseReason(''); setForceCloseTime(''); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--gx-white)', borderRadius: '12px', padding: '24px',
              width: '400px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)', margin: '0 0 16px' }}>
              강제 종료
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--gx-slate)', marginBottom: '16px' }}>
              {maskName(forceCloseTarget.workerName)} 작업을 강제 종료합니다.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gx-steel)', display: 'block', marginBottom: '4px' }}>
                  사유 *
                </label>
                <textarea
                  value={forceCloseReason}
                  onChange={e => setForceCloseReason(e.target.value)}
                  placeholder="강제 종료 사유를 입력하세요"
                  rows={3}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: '8px',
                    border: '1px solid var(--gx-mist)', fontSize: '13px',
                    color: 'var(--gx-charcoal)', resize: 'vertical', outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gx-steel)', display: 'block', marginBottom: '4px' }}>
                  완료 시각 (미입력 시 현재 시각)
                </label>
                <input
                  type="datetime-local"
                  value={forceCloseTime}
                  onChange={e => setForceCloseTime(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: '8px',
                    border: '1px solid var(--gx-mist)', fontSize: '13px',
                    color: 'var(--gx-charcoal)', outline: 'none',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button
                onClick={() => { setForceCloseTarget(null); setForceCloseReason(''); setForceCloseTime(''); }}
                style={{
                  padding: '8px 20px', borderRadius: '8px', border: '1px solid var(--gx-mist)',
                  background: 'var(--gx-white)', color: 'var(--gx-slate)', fontSize: '13px', cursor: 'pointer',
                }}
              >취소</button>
              <button
                onClick={handleForceCloseSubmit}
                disabled={!forceCloseReason.trim() || forceClose.isPending}
                style={{
                  padding: '8px 20px', borderRadius: '8px', border: 'none',
                  background: forceCloseReason.trim() ? 'var(--gx-danger)' : 'var(--gx-mist)',
                  color: '#fff', fontSize: '13px', fontWeight: 600,
                  cursor: forceCloseReason.trim() && !forceClose.isPending ? 'pointer' : 'not-allowed',
                }}
              >{forceClose.isPending ? '처리 중...' : '강제 종료'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
