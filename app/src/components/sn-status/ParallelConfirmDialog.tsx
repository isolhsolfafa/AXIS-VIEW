// src/components/sn-status/ParallelConfirmDialog.tsx
// Sprint 40 — O/N 내 Tank Module 일괄 시작/종료 확인 모달
// ARIA + initial focus + ESC 닫기 (focus trap 미구현 — 단일 모달, 향후 다중 모달 시 react-focus-lock)

import { useEffect, useId, useRef } from 'react';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { DialogActions } from './DialogActions';

interface ParallelConfirmDialogProps {
  open: boolean;
  action: 'start' | 'complete';
  onNumber: string;
  otherCount: number;
  partnerNullCount?: number;
  onConfirm: (mode: 'batch' | 'single') => void;
  onClose: () => void;
}

export function ParallelConfirmDialog({
  open,
  action,
  onNumber,
  otherCount,
  partnerNullCount = 0,
  onConfirm,
  onClose,
}: ParallelConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEscapeKey(open, onClose);

  useEffect(() => {
    if (open) primaryRef.current?.focus();
  }, [open]);

  if (!open) return null;
  const verb = action === 'start' ? '시작' : '종료';
  const status = action === 'start' ? '미시작' : '미종료';

  return (
    <div
      onClick={onClose}
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--gx-white)',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '440px',
          width: '90%',
          boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
        }}
      >
        <h3 id={titleId} style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)', marginBottom: '12px' }}>
          Tank Module 병렬 {verb}
        </h3>
        <p id={descId} style={{ fontSize: '13px', color: 'var(--gx-graphite)', lineHeight: 1.6, margin: 0 }}>
          O/N <strong>{onNumber}</strong> 에 Tank Module {status} S/N 이 <strong>{otherCount}</strong>대 더 있습니다.
          <br />
          병렬 진행으로 일괄 {verb} 하시겠습니까?
        </p>
        {partnerNullCount > 0 && (
          <p
            role="alert"
            style={{
              marginTop: '12px',
              padding: '8px 12px',
              background: 'rgba(245,158,11,0.1)',
              color: 'var(--gx-warning)',
              borderRadius: '6px',
              fontSize: '12px',
              lineHeight: 1.5,
            }}
          >
            ⚠️ partner 매핑 누락 S/N {partnerNullCount}대 (module_outsourcing/mech_partner) — BE 데이터 보강 필요 (카운트에서 제외됨)
          </p>
        )}
        <DialogActions
          primaryRef={primaryRef}
          primaryLabel={`네 — ${otherCount + 1}대 일괄 ${verb}`}
          secondaryLabel={`아니오 — 1대만 ${verb}`}
          onPrimary={() => onConfirm('batch')}
          onSecondary={() => onConfirm('single')}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
