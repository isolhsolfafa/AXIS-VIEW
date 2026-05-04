// src/components/sn-status/DialogActions.tsx
// Sprint 40 (A12 β) — Dialog 내부 버튼 영역. ParallelConfirmDialog 본체 ≤60줄 분해용.

import type { Ref } from 'react';

interface DialogActionsProps {
  primaryLabel: string;
  secondaryLabel: string;
  closeLabel?: string;
  onPrimary: () => void;
  onSecondary: () => void;
  onClose: () => void;
  primaryRef?: Ref<HTMLButtonElement>;
  primaryDisabled?: boolean;
}

const buttonBase: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  border: 'none',
};

export function DialogActions({
  primaryLabel,
  secondaryLabel,
  closeLabel = '취소',
  onPrimary,
  onSecondary,
  onClose,
  primaryRef,
  primaryDisabled,
}: DialogActionsProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
      <button
        type="button"
        onClick={onClose}
        style={{ ...buttonBase, background: 'transparent', color: 'var(--gx-steel)' }}
      >
        {closeLabel}
      </button>
      <button
        type="button"
        onClick={onSecondary}
        style={{ ...buttonBase, background: 'var(--gx-mist)', color: 'var(--gx-charcoal)' }}
      >
        {secondaryLabel}
      </button>
      <button
        ref={primaryRef}
        type="button"
        onClick={onPrimary}
        disabled={primaryDisabled}
        style={{
          ...buttonBase,
          background: primaryDisabled ? 'var(--gx-mist)' : 'var(--gx-accent)',
          color: primaryDisabled ? 'var(--gx-steel)' : 'var(--gx-white)',
          cursor: primaryDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        {primaryLabel}
      </button>
    </div>
  );
}
