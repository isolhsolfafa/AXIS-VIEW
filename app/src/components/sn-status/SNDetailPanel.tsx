// src/components/sn-status/SNDetailPanel.tsx
// S/N 상세 사이드 패널 — Sprint 33 (미종료/미시작 관리 + 강제종료)

import type { SNProduct, SNTaskDetail, TaskWorker } from '@/types/snStatus';
import { PROCESS_ORDER, PROCESS_LABEL } from './constants';
import ProcessStepCard from './ProcessStepCard';
import { useChecklist } from '@/hooks/useChecklist';

// 체크리스트 대상 카테고리 (MECH/ELEC/TMS만)
const CHECKLIST_CATEGORIES = new Set(['MECH', 'ELEC', 'TMS']);

// 미종료 경고 기준 (14시간)
const OVERDUE_HOURS = 14;

interface SNDetailPanelProps {
  serialNumber: string;
  product: SNProduct;
  tasks: SNTaskDetail[];
  isLoading: boolean;
  onClose: () => void;
  canReactivate?: boolean;
  canForceClose?: boolean;     // Sprint 33: 강제종료 버튼 표시 여부 (Admin 또는 Manager)
  currentUserCompany?: string; // Sprint 33: Manager 행 레벨 권한 판단용
  isAdmin?: boolean;           // Sprint 33: Admin은 모든 task 강제종료 가능
}

// 카테고리별 미종료/미시작 건수 계산
// allTasks: S/N 전체 tasks (미시작 판단용 — "같은 S/N 다른 task 완료" 조건)
function getPendingCounts(catTasks: SNTaskDetail[], allTasks: SNTaskDetail[]) {
  const now = Date.now();

  // 미종료: task_detail 단위 dedup (같은 task에 여러 worker가 있어도 1건)
  const overdueTaskIds = new Set<number>();
  for (const t of catTasks) {
    for (const w of t.workers) {
      if (w.started_at && !w.completed_at) {
        const elapsed = (now - new Date(w.started_at).getTime()) / (1000 * 60 * 60);
        if (elapsed > OVERDUE_HOURS) overdueTaskIds.add(t.id);
      }
    }
  }

  // 미시작: workers=[]인 task (S/N 전체에서 완료 task 있을 때만)
  const hasCompletedAnywhere = allTasks.some(t => t.workers.some(w => w.status === 'completed'));
  const notStartedCount = hasCompletedAnywhere
    ? catTasks.filter(t => t.workers.length === 0).length
    : 0;

  return { overdueCount: overdueTaskIds.size, notStartedCount };
}

// 각 카테고리별 체크리스트 hook wrapper
function ChecklistProcessCard({
  cat,
  serialNumber,
  task,
  categoryPercent,
  canReactivate,
  canForceClose,
  currentUserCompany,
  isAdmin,
  pendingBadges,
}: {
  cat: string;
  serialNumber: string;
  task: SNTaskDetail | null;
  categoryPercent?: number;
  canReactivate?: boolean;
  canForceClose?: boolean;
  currentUserCompany?: string;
  isAdmin?: boolean;
  pendingBadges?: React.ReactNode;
}) {
  const { data: checklist, isLoading: clLoading } = useChecklist(serialNumber, cat);
  return (
    <ProcessStepCard
      task={task}
      displayLabel={PROCESS_LABEL[cat] ?? cat}
      categoryPercent={categoryPercent}
      checklist={checklist}
      checklistLoading={clLoading}
      canReactivate={canReactivate}
      canForceClose={canForceClose}
      currentUserCompany={currentUserCompany}
      isAdmin={isAdmin}
      pendingBadges={pendingBadges}
    />
  );
}

export default function SNDetailPanel({ serialNumber, product, tasks, isLoading, onClose, canReactivate, canForceClose, currentUserCompany, isAdmin }: SNDetailPanelProps) {
  const completedCount = PROCESS_ORDER.filter(cat => {
    const catData = product.categories[cat];
    return catData && catData.percent === 100;
  }).length;
  const totalCount = PROCESS_ORDER.filter(cat => product.categories[cat] != null).length;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '480px',
        maxWidth: '100vw',
        height: '100vh',
        background: 'var(--gx-white)',
        borderLeft: '1px solid var(--gx-mist)',
        boxShadow: '-8px 0 24px rgba(0,0,0,0.08)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.2s ease',
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--gx-mist)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--gx-accent)',
              fontWeight: 500,
              padding: '4px 0',
            }}
          >
            ← S/N 목록
          </button>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)', fontFamily: "'JetBrains Mono', monospace" }}>
            {serialNumber}
          </span>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--gx-slate)', display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span style={{ fontWeight: 600, color: 'var(--gx-charcoal)' }}>{product.model}</span>
          <span>·</span>
          <span>{product.customer}</span>
          {product.ship_plan_date && (
            <>
              <span>·</span>
              <span>출하: {product.ship_plan_date}</span>
            </>
          )}
        </div>

        {/* Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--gx-steel)' }}>Progress</span>
            <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: product.all_completed ? 'var(--gx-success)' : 'var(--gx-charcoal)' }}>
              {product.overall_percent}% ({completedCount}/{totalCount} 공정)
            </span>
          </div>
          <div style={{ height: '6px', borderRadius: '3px', background: 'var(--gx-cloud)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${product.overall_percent}%`,
                borderRadius: '3px',
                background: product.all_completed ? 'var(--gx-success)' : 'var(--gx-accent)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* 공정 리스트 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: 'var(--gx-cloud)',
                borderRadius: 'var(--radius-gx-md, 10px)',
                height: '64px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))
        ) : (
          PROCESS_ORDER.map((cat) => {
            if (product.categories[cat] == null) return null;
            const catTasks = tasks.filter(t => t.task_category === cat);

            // 같은 카테고리의 모든 task workers를 병합하여 1개 카드로 렌더링
            // Sprint 33: workers=[]인 미시작 task도 포함 (flatMap 소실 방지)
            // FE-19.1 (v1.32.1): 부모 task의 force_closed 관련 필드 4개를 각 worker row에 전파 → per-row 🔒 표시
            const allWorkers: TaskWorker[] = [];
            for (const t of catTasks) {
              const forceClosedFields = {
                force_closed: t.force_closed,
                close_reason: t.close_reason,
                closed_by_name: t.closed_by_name,
                force_closed_at: t.force_closed ? t.completed_at ?? null : null,
              };
              if (t.workers.length > 0) {
                allWorkers.push(...t.workers.map(w => ({
                  ...w,
                  task_name: t.task_name,
                  task_detail_id: t.id,
                  ...forceClosedFields,
                })));
              } else {
                // workers=[] 미시작 task → placeholder worker row 주입
                allWorkers.push({
                  worker_id: 0,
                  worker_name: '-',
                  company: null,
                  started_at: null,
                  completed_at: null,
                  duration_minutes: null,
                  status: 'not_started',
                  task_name: t.task_name,
                  task_detail_id: t.id,
                  ...forceClosedFields,
                });
              }
            }

            const mergedTask: SNTaskDetail | null = catTasks.length > 0
              ? {
                  id: catTasks[0].id,
                  task_name: catTasks[0].task_name,
                  task_category: cat,
                  workers: allWorkers,
                  my_status: catTasks.some(t => t.my_status === 'in_progress') ? 'in_progress'
                    : catTasks.some(t => t.my_status === 'completed') ? 'completed'
                    : 'not_started',
                  // Sprint 33: 강제종료 여부 (하나라도 force_closed면 표시)
                  force_closed: catTasks.some(t => t.force_closed),
                }
              : null;

            // 미종료/미시작 건수 계산 (allTasks=S/N 전체)
            const { overdueCount, notStartedCount } = getPendingCounts(
              catTasks,
              tasks,
            );

            const pendingBadges = (
              <span style={{ display: 'flex', gap: '4px' }}>
                {overdueCount > 0 && (
                  <span style={{
                    fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '8px',
                    background: 'rgba(239,68,68,0.1)', color: 'var(--gx-danger)',
                  }}>
                    ⚠️ 미종료 {overdueCount}건
                  </span>
                )}
                {notStartedCount > 0 && (
                  <span style={{
                    fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '8px',
                    background: 'rgba(245,158,11,0.1)', color: 'var(--gx-warning)',
                  }}>
                    ⏳ 미시작 {notStartedCount}건
                  </span>
                )}
              </span>
            );

            if (CHECKLIST_CATEGORIES.has(cat)) {
              return (
                <ChecklistProcessCard
                  key={cat}
                  cat={cat}
                  serialNumber={serialNumber}
                  task={mergedTask}
                  categoryPercent={product.categories[cat]?.percent}
                  canReactivate={canReactivate}
                  canForceClose={canForceClose}
                  currentUserCompany={currentUserCompany}
                  isAdmin={isAdmin}
                  pendingBadges={pendingBadges}
                />
              );
            }

            return (
              <ProcessStepCard
                key={cat}
                task={mergedTask}
                displayLabel={PROCESS_LABEL[cat] ?? cat}
                categoryPercent={product.categories[cat]?.percent}
                canReactivate={canReactivate}
                canForceClose={canForceClose}
                currentUserCompany={currentUserCompany}
                isAdmin={isAdmin}
                pendingBadges={pendingBadges}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
