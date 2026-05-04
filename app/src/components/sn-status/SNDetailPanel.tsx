// src/components/sn-status/SNDetailPanel.tsx
// S/N 상세 사이드 패널 — Sprint 33 (미종료/미시작 관리 + 강제종료) + Sprint 40 (Tank Module 시작/종료 + 일괄)

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { SNProduct, SNTaskDetail, TaskWorker } from '@/types/snStatus';
import { PROCESS_ORDER, PROCESS_LABEL } from './constants';
import ProcessStepCard from './ProcessStepCard';
import { useChecklist } from '@/hooks/useChecklist';
import { useGetTasksByOrder } from '@/hooks/useGetTasksByOrder';
import { useStartTaskMutation } from '@/hooks/useStartTask';
import { useCompleteTaskMutation } from '@/hooks/useCompleteTask';
import { useStartTaskBatchMutation } from '@/hooks/useStartTaskBatch';
import { useCompleteTaskBatchMutation } from '@/hooks/useCompleteTaskBatch';
import {
  isTankModule,
  getTaskCompany,
  getOtherSNsTankStartable,
  getOtherSNsTankCompletable,
  TANK_MODULE_CATEGORIES,
  SKIPPED_REASON_LABEL,
} from './utils';
import { ParallelConfirmDialog } from './ParallelConfirmDialog';
import type { BatchResponse } from '@/api/snStatus';

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
  orderProducts?: SNProduct[]; // Sprint 40: 같은 O/N 의 product 목록 (partner 매핑용)
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
  mechPartner,
  elecPartner,
  moduleOutsourcing,
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
  mechPartner?: string | null;
  elecPartner?: string | null;
  moduleOutsourcing?: string | null;
}) {
  const { data: checklist, isLoading: clLoading } = useChecklist(serialNumber, cat);
  return (
    <ProcessStepCard
      task={task}
      displayLabel={PROCESS_LABEL[cat] ?? cat}
      category={cat}
      mechPartner={mechPartner}
      elecPartner={elecPartner}
      moduleOutsourcing={moduleOutsourcing}
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

// Sprint 40: skipped 결과를 한국어 토스트 메시지로 변환
function formatBatchResult(res: BatchResponse, verb: string): string {
  const ok = res.succeeded.length;
  const skip = res.skipped.length;
  if (skip === 0) return `${ok}대 ${verb} 완료`;
  const counts: Record<string, number> = {};
  for (const s of res.skipped) {
    counts[s.reason] = (counts[s.reason] ?? 0) + 1;
  }
  const detail = Object.entries(counts)
    .map(([k, v]) => `${SKIPPED_REASON_LABEL[k] ?? k} ${v}`)
    .join(', ');
  return `${ok}대 ${verb} 완료 (${skip}대 스킵: ${detail})`;
}

export default function SNDetailPanel({ serialNumber, product, tasks, isLoading, onClose, canReactivate, canForceClose, currentUserCompany, isAdmin, orderProducts }: SNDetailPanelProps) {
  const completedCount = PROCESS_ORDER.filter(cat => {
    const catData = product.categories[cat];
    return catData && catData.percent === 100;
  }).length;
  const totalCount = PROCESS_ORDER.filter(cat => product.categories[cat] != null).length;

  // ---- Sprint 40: Tank Module 시작/종료 ----
  const canStartStop = !!canForceClose;
  const tankProducts: SNProduct[] = orderProducts ?? [product];

  // 같은 O/N 의 다른 S/N Tank Module tasks (P2: TMS+MECH)
  const { data: orderTasks } = useGetTasksByOrder(product.sales_order, {
    taskCategories: [...TANK_MODULE_CATEGORIES],
    taskId: 'TANK_MODULE',
    enabled: !!product.sales_order && canStartStop,
  });

  const otherSNsTankStartable = useMemo(
    () => getOtherSNsTankStartable({
      orderTasks,
      orderProducts: tankProducts,
      currentSn: product.serial_number,
      isAdmin: !!isAdmin,
      currentUserCompany,
    }),
    [orderTasks, tankProducts, product.serial_number, isAdmin, currentUserCompany],
  );

  const otherSNsTankCompletable = useMemo(
    () => getOtherSNsTankCompletable({
      orderTasks,
      orderProducts: tankProducts,
      currentSn: product.serial_number,
      isAdmin: !!isAdmin,
      currentUserCompany,
    }),
    [orderTasks, tankProducts, product.serial_number, isAdmin, currentUserCompany],
  );

  // partner=NULL 미시작 카운트 (manager 만, 자기 제외, isTankModule 방어)
  const partnerNullCount = useMemo(() => {
    if (isAdmin) return 0;
    return (orderTasks ?? []).filter(t =>
      isTankModule(t)
      && t.serial_number !== product.serial_number
      && !t.workers.some(w => w.started_at)
      && getTaskCompany(t, tankProducts) === null,
    ).length;
  }, [orderTasks, tankProducts, product.serial_number, isAdmin]);

  const startMut = useStartTaskMutation(serialNumber);
  const completeMut = useCompleteTaskMutation(serialNumber);
  const startBatchMut = useStartTaskBatchMutation(serialNumber);
  const completeBatchMut = useCompleteTaskBatchMutation(serialNumber);

  const [parallelDialog, setParallelDialog] = useState<{
    action: 'start' | 'complete';
    taskId: number;
    others: SNTaskDetail[];
  } | null>(null);

  function handleTankStart(task: SNTaskDetail) {
    if (otherSNsTankStartable.length === 0) {
      startMut.mutate(task.id, {
        onSuccess: () => toast.success('Tank Module 시작'),
        onError: () => toast.error('시작 실패. 다시 시도해주세요.'),
      });
    } else {
      setParallelDialog({ action: 'start', taskId: task.id, others: otherSNsTankStartable });
    }
  }

  function handleTankComplete(task: SNTaskDetail) {
    if (otherSNsTankCompletable.length === 0) {
      completeMut.mutate(task.id, {
        onSuccess: () => toast.success('Tank Module 종료'),
        onError: () => toast.error('종료 실패. 다시 시도해주세요.'),
      });
    } else {
      setParallelDialog({ action: 'complete', taskId: task.id, others: otherSNsTankCompletable });
    }
  }

  function handleParallelConfirm(mode: 'batch' | 'single') {
    if (!parallelDialog) return;
    const { action, taskId, others } = parallelDialog;
    if (mode === 'single') {
      const mut = action === 'start' ? startMut : completeMut;
      mut.mutate(taskId, {
        onSuccess: () => toast.success(`Tank Module ${action === 'start' ? '시작' : '종료'}`),
        onError: () => toast.error('처리 실패. 다시 시도해주세요.'),
      });
    } else {
      const ids = [taskId, ...others.map(o => o.id)];
      const mut = action === 'start' ? startBatchMut : completeBatchMut;
      mut.mutate(ids, {
        onSuccess: (res) => {
          const verb = action === 'start' ? '시작' : '종료';
          toast.success(formatBatchResult(res, verb));
        },
        onError: () => toast.error('일괄 처리 실패.'),
      });
    }
    setParallelDialog(null);
  }

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
          {/* Sprint 34 (FE-21, v1.33.0): 고객사 공정 라인 — BE FIX-25 progress API 확장 후 활성화, 미배포 시 undefined 자동 생략 */}
          {product.line && product.line.trim().length > 0 && (
            <>
              <span>·</span>
              <span>{product.line}</span>
            </>
          )}
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
            // Sprint 40: 카테고리 내 Tank Module task (있으면)
            const tankTask = catTasks.find(t => isTankModule(t));

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

            // Sprint 40: Tank Module 시작/종료 액션 버튼 (canStartStop && tankTask)
            const tankAction = canStartStop && tankTask ? (
              <TankModuleActions
                task={tankTask}
                onStart={handleTankStart}
                onComplete={handleTankComplete}
                pending={startMut.isPending || completeMut.isPending || startBatchMut.isPending || completeBatchMut.isPending}
              />
            ) : null;

            if (CHECKLIST_CATEGORIES.has(cat)) {
              return (
                <div key={cat}>
                  <ChecklistProcessCard
                    cat={cat}
                    serialNumber={serialNumber}
                    task={mergedTask}
                    categoryPercent={product.categories[cat]?.percent}
                    canReactivate={canReactivate}
                    canForceClose={canForceClose}
                    currentUserCompany={currentUserCompany}
                    isAdmin={isAdmin}
                    pendingBadges={pendingBadges}
                    mechPartner={product.mech_partner}
                    elecPartner={product.elec_partner}
                    moduleOutsourcing={product.module_outsourcing}
                  />
                  {tankAction}
                </div>
              );
            }

            return (
              <div key={cat}>
                <ProcessStepCard
                  task={mergedTask}
                  displayLabel={PROCESS_LABEL[cat] ?? cat}
                  category={cat}
                  mechPartner={product.mech_partner}
                  elecPartner={product.elec_partner}
                  moduleOutsourcing={product.module_outsourcing}
                  categoryPercent={product.categories[cat]?.percent}
                  canReactivate={canReactivate}
                  canForceClose={canForceClose}
                  currentUserCompany={currentUserCompany}
                  isAdmin={isAdmin}
                  pendingBadges={pendingBadges}
                />
                {tankAction}
              </div>
            );
          })
        )}
      </div>

      {/* Sprint 40: O/N 일괄 확인 모달 */}
      <ParallelConfirmDialog
        open={parallelDialog !== null}
        action={parallelDialog?.action ?? 'start'}
        onNumber={product.sales_order ?? ''}
        otherCount={parallelDialog?.others.length ?? 0}
        partnerNullCount={partnerNullCount}
        onConfirm={handleParallelConfirm}
        onClose={() => setParallelDialog(null)}
      />
    </div>
  );
}

// Sprint 40: Tank Module 시작/종료 inline 버튼 (카드 아래)
interface TankModuleActionsProps {
  task: SNTaskDetail;
  onStart: (task: SNTaskDetail) => void;
  onComplete: (task: SNTaskDetail) => void;
  pending: boolean;
}

function TankModuleActions({ task, onStart, onComplete, pending }: TankModuleActionsProps) {
  const allNotStarted = task.workers.every(w => !w.started_at);
  const someInProgress = task.workers.some(w => w.started_at && !w.completed_at);
  if (!allNotStarted && !someInProgress) return null;
  return (
    <div style={{ display: 'flex', gap: '6px', padding: '6px 4px 0 4px', justifyContent: 'flex-end' }}>
      {allNotStarted && (
        <button
          type="button"
          onClick={() => onStart(task)}
          disabled={pending}
          style={{
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 600,
            background: 'var(--gx-info)',
            color: 'var(--gx-white)',
            border: 'none',
            borderRadius: '6px',
            cursor: pending ? 'not-allowed' : 'pointer',
            opacity: pending ? 0.6 : 1,
          }}
        >
          ▶ Tank Module 시작
        </button>
      )}
      {someInProgress && (
        <button
          type="button"
          onClick={() => onComplete(task)}
          disabled={pending}
          style={{
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 600,
            background: 'var(--gx-success)',
            color: 'var(--gx-white)',
            border: 'none',
            borderRadius: '6px',
            cursor: pending ? 'not-allowed' : 'pointer',
            opacity: pending ? 0.6 : 1,
          }}
        >
          ■ Tank Module 종료
        </button>
      )}
    </div>
  );
}
