// src/components/sn-status/SNDetailPanel.tsx
// S/N 상세 사이드 패널 — Sprint 18 + Sprint 20 체크리스트 연동

import type { SNProduct, SNTaskDetail } from '@/types/snStatus';
import { PROCESS_ORDER, PROCESS_LABEL } from './constants';
import ProcessStepCard from './ProcessStepCard';
import { useChecklist } from '@/hooks/useChecklist';

// 체크리스트 대상 카테고리 (MECH/ELEC/TMS만)
const CHECKLIST_CATEGORIES = new Set(['MECH', 'ELEC', 'TMS']);

interface SNDetailPanelProps {
  serialNumber: string;
  product: SNProduct;
  tasks: SNTaskDetail[];
  isLoading: boolean;
  onClose: () => void;
}

// 각 카테고리별 체크리스트 hook wrapper
function ChecklistProcessCard({
  cat,
  serialNumber,
  task,
}: {
  cat: string;
  serialNumber: string;
  task: SNTaskDetail | null;
}) {
  const { data: checklist, isLoading: clLoading } = useChecklist(serialNumber, cat);
  return (
    <ProcessStepCard
      task={task}
      displayLabel={PROCESS_LABEL[cat] ?? cat}
      checklist={checklist}
      checklistLoading={clLoading}
    />
  );
}

export default function SNDetailPanel({ serialNumber, product, tasks, isLoading, onClose }: SNDetailPanelProps) {
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
            const mergedTask: SNTaskDetail | null = catTasks.length > 0
              ? {
                  id: catTasks[0].id,
                  task_name: catTasks[0].task_name,
                  task_category: cat,
                  workers: catTasks.flatMap(t =>
                    t.workers.map(w => ({ ...w, task_name: t.task_name }))
                  ),
                  my_status: catTasks.some(t => t.my_status === 'in_progress') ? 'in_progress'
                    : catTasks.some(t => t.my_status === 'completed') ? 'completed'
                    : 'not_started',
                }
              : null;

            if (CHECKLIST_CATEGORIES.has(cat)) {
              return (
                <ChecklistProcessCard
                  key={cat}
                  cat={cat}
                  serialNumber={serialNumber}
                  task={mergedTask}
                />
              );
            }

            return (
              <ProcessStepCard
                key={cat}
                task={mergedTask}
                displayLabel={PROCESS_LABEL[cat] ?? cat}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
