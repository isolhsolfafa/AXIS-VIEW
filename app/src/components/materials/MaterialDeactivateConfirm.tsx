// src/components/materials/MaterialDeactivateConfirm.tsx
// 자재 비활성화 확인 모달 — Sprint 42 (M-NEW-4-B: warn + keep 패턴)
// 비활성화 시 기존 매핑 보존 + 작업자 dropdown 자동 제외 (is_active=FALSE 필터)

import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deactivateMaterial } from '@/api/materials';
import type { Material } from '@/api/materials';

interface Props {
  material: Material;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MaterialDeactivateConfirm({ material, onClose, onSuccess }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: () => deactivateMaterial(material.id),
    onSuccess: (result) => {
      if (result.mappings_kept.length > 0) {
        toast.warning(
          `자재가 ${result.mappings_kept.length}개 검사 항목에 매핑되어 있습니다. ` +
          `작업자 dropdown 에서 자동 제외되며 매핑은 보존됩니다.`,
          { duration: 6000 },
        );
      } else {
        toast.success('자재가 비활성화되었습니다.');
      }
      onSuccess();
    },
    onError: () => {
      toast.error('비활성화 중 오류가 발생했습니다.');
    },
  });

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="deactivate-title" style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 id="deactivate-title" style={titleStyle}>⚠️ 자재 비활성화</h2>

        <div style={infoBoxStyle}>
          <div style={{ fontSize: '11px', color: 'var(--gx-steel)' }}>자재코드</div>
          <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{material.item_code}</div>
          <div style={{ fontSize: '12px', color: 'var(--gx-charcoal)', marginTop: '4px' }}>{material.item_name}</div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--gx-charcoal)', lineHeight: 1.6 }}>
          비활성화 시:
        </p>
        <ul style={{ fontSize: '12px', color: 'var(--gx-charcoal)', lineHeight: 1.7, paddingLeft: '20px' }}>
          <li>실제 데이터는 <strong>삭제되지 않습니다</strong> (`is_active=FALSE` 만 변경)</li>
          <li>작업자 체크리스트 dropdown 에서 <strong>자동 제외</strong>됩니다</li>
          <li>기존 체크리스트 매핑은 <strong>보존</strong>됩니다 (재활성화 시 자동 복원)</li>
          <li>기존 작업 기록 (`checklist_record`) 은 영향 없음</li>
        </ul>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
          <button type="button" onClick={onClose} style={btnSecondaryStyle}>취소</button>
          <button type="button" onClick={() => mutation.mutate()} disabled={mutation.isPending} style={btnDangerStyle}>
            {mutation.isPending ? '처리 중...' : '비활성화'}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalStyle: React.CSSProperties = { background: 'var(--gx-white)', borderRadius: '12px', padding: '24px', width: '440px', maxWidth: '90vw' };
const titleStyle: React.CSSProperties = { fontSize: '16px', fontWeight: 600, color: 'var(--gx-warning)', margin: '0 0 12px 0' };
const infoBoxStyle: React.CSSProperties = { padding: '10px 12px', background: 'var(--gx-snow)', borderRadius: '6px', marginBottom: '12px' };
const btnSecondaryStyle: React.CSSProperties = { padding: '8px 16px', fontSize: '13px', fontWeight: 500, border: '1px solid var(--gx-mist)', borderRadius: '6px', background: 'var(--gx-white)', color: 'var(--gx-charcoal)', cursor: 'pointer' };
const btnDangerStyle: React.CSSProperties = { padding: '8px 16px', fontSize: '13px', fontWeight: 500, border: 'none', borderRadius: '6px', background: 'var(--gx-danger)', color: 'white', cursor: 'pointer' };
