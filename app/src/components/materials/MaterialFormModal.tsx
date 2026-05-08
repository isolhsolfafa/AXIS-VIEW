// src/components/materials/MaterialFormModal.tsx
// 자재 직접 입력 모달 — Sprint 42 (FEAT-AXIS-VIEW-MATERIALS-AND-CHECKLISTS-MGMT-20260507)

import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createMaterial, updateMaterial } from '@/api/materials';
import type { Material } from '@/api/materials';

interface MaterialFormModalProps {
  mode: 'create' | 'edit';
  initial?: Material;
  onClose: () => void;
  onSuccess: () => void;
}

const UNIT_OPTIONS = ['EA', 'M', 'KG', 'L', 'SET', 'BOX'];

export default function MaterialFormModal({ mode, initial, onClose, onSuccess }: MaterialFormModalProps) {
  const [itemCode, setItemCode] = useState(initial?.item_code ?? '');
  const [itemName, setItemName] = useState(initial?.item_name ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [spec1, setSpec1] = useState(initial?.spec_1 ?? '');
  const [spec2, setSpec2] = useState(initial?.spec_2 ?? '');
  const [unit, setUnit] = useState(initial?.unit ?? 'EA');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  const firstInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { firstInputRef.current?.focus(); }, []);

  // ESC 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload: Partial<Material> = {
        item_code: itemCode.trim(),
        item_name: itemName.trim(),
        category: category.trim() || undefined,
        spec_1: spec1.trim() || undefined,
        spec_2: spec2.trim() || undefined,
        unit: unit.trim(),
        description: description.trim() || undefined,
        is_active: isActive,
      };
      return mode === 'create'
        ? createMaterial(payload)
        : updateMaterial(initial!.id, payload);
    },
    onSuccess,
    onError: (err: any) => {
      const status = err?.response?.status;
      const detail = err?.response?.data?.error;
      if (status === 409 || detail === 'DUPLICATE_ITEM_CODE') {
        toast.error('이미 등록된 자재코드입니다.');
      } else if (status === 400) {
        toast.error('필수 항목을 확인해주세요.');
      } else {
        toast.error('저장 중 오류가 발생했습니다.');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCode.trim() || !itemName.trim()) {
      toast.error('자재코드와 자재내역은 필수입니다.');
      return;
    }
    mutation.mutate();
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="material-form-title" style={overlayStyle} onClick={onClose}>
      <form onSubmit={handleSubmit} style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 id="material-form-title" style={titleStyle}>
          {mode === 'create' ? '자재 추가' : '자재 수정'}
        </h2>

        <Field label="자재코드 *">
          <input
            ref={firstInputRef}
            type="text"
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            disabled={mode === 'edit'}
            placeholder="예: 1110006700"
            style={inputStyle}
          />
        </Field>

        <Field label="자재내역 *">
          <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="예: MFC" style={inputStyle} />
        </Field>

        <Field label="카테고리">
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="예: MFC, O-RING" style={inputStyle} />
        </Field>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Field label="규격1" flex>
            <input type="text" value={spec1} onChange={(e) => setSpec1(e.target.value)} placeholder="예: MRC | 25 SLM" style={inputStyle} />
          </Field>
          <Field label="규격2" flex>
            <input type="text" value={spec2} onChange={(e) => setSpec2(e.target.value)} placeholder="예: P:0.2~1 / W:0.4" style={inputStyle} />
          </Field>
        </div>

        <Field label="단위">
          <select value={unit} onChange={(e) => setUnit(e.target.value)} style={inputStyle}>
            {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </Field>

        <Field label="비고 (가스 종류 — MFC: LNG/CDA/O2/N2 또는 'LNG,O2')">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="MFC 카테고리 시 가스 종류 입력 (체크리스트 매핑 필터용)"
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </Field>

        <Field label="활성">
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            활성 상태 (체크리스트 dropdown 노출)
          </label>
        </Field>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
          <button type="button" onClick={onClose} style={btnSecondaryStyle}>취소</button>
          <button type="submit" disabled={mutation.isPending} style={btnPrimaryStyle}>
            {mutation.isPending ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, flex, children }: { label: string; flex?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '12px', flex: flex ? 1 : undefined }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--gx-slate)', marginBottom: '4px' }}>{label}</label>
      {children}
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
const modalStyle: React.CSSProperties = {
  background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-md, 12px)', padding: '24px',
  width: '480px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto',
};
const titleStyle: React.CSSProperties = {
  fontSize: '16px', fontWeight: 600, color: 'var(--gx-charcoal)', margin: '0 0 16px 0',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', fontSize: '13px',
  border: '1px solid var(--gx-mist)', borderRadius: 'var(--radius-gx-sm, 6px)',
  boxSizing: 'border-box',
};
const btnSecondaryStyle: React.CSSProperties = {
  padding: '8px 16px', fontSize: '13px', fontWeight: 500,
  border: '1px solid var(--gx-mist)', borderRadius: 'var(--radius-gx-sm, 6px)',
  background: 'var(--gx-white)', color: 'var(--gx-charcoal)', cursor: 'pointer',
};
const btnPrimaryStyle: React.CSSProperties = {
  padding: '8px 16px', fontSize: '13px', fontWeight: 500,
  border: 'none', borderRadius: 'var(--radius-gx-sm, 6px)',
  background: 'var(--gx-accent)', color: 'white', cursor: 'pointer',
};
