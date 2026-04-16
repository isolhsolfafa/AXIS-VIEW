// src/components/checklist/ChecklistEditModal.tsx
// 체크리스트 항목 수정 모달 — Sprint 32 (qi_check_required 읽기 전용)

import { useState } from 'react';
import type { ChecklistMasterItem, UpdateMasterPayload } from '@/types/checklist';

interface ChecklistEditModalProps {
  item: ChecklistMasterItem;
  category: string;
  onSubmit: (data: UpdateMasterPayload) => void;
  onClose: () => void;
}

export default function ChecklistEditModal({ item, category, onSubmit, onClose }: ChecklistEditModalProps) {
  const isElec = category === 'ELEC';

  const [itemName, setItemName] = useState(item.item_name);
  const [description, setDescription] = useState(item.description ?? '');
  const [phase1Applicable, setPhase1Applicable] = useState(item.phase1_applicable ?? true);
  const [selectOptionsInput, setSelectOptionsInput] = useState(
    item.select_options?.join(', ') ?? ''
  );
  const [remarks, setRemarks] = useState(item.remarks ?? '');

  const handleSubmit = () => {
    if (!itemName.trim()) return;
    const data: UpdateMasterPayload = {};
    if (itemName.trim() !== item.item_name) data.item_name = itemName.trim();
    if (description.trim() !== (item.description ?? '')) data.description = description.trim() || undefined;
    if (isElec && phase1Applicable !== (item.phase1_applicable ?? true)) data.phase1_applicable = phase1Applicable;
    if (item.item_type === 'SELECT' && selectOptionsInput.trim()) {
      const newOpts = selectOptionsInput.split(',').map(s => s.trim()).filter(Boolean);
      const oldOpts = item.select_options ?? [];
      if (JSON.stringify(newOpts) !== JSON.stringify(oldOpts)) data.select_options = newOpts;
    }
    if (remarks.trim() !== (item.remarks ?? '')) data.remarks = remarks.trim() || undefined;
    // 변경사항이 없으면 그냥 닫기
    if (Object.keys(data).length === 0) { onClose(); return; }
    onSubmit(data);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: '8px',
    border: '1px solid var(--gx-mist)', fontSize: '13px',
    color: 'var(--gx-charcoal)', background: 'var(--gx-white)', outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px', fontWeight: 600, color: 'var(--gx-slate)',
    marginBottom: '4px', display: 'block',
  };

  const readonlyStyle: React.CSSProperties = {
    ...inputStyle, background: 'var(--gx-cloud)', color: 'var(--gx-steel)', cursor: 'not-allowed',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg, 14px)',
          padding: '24px', width: '480px', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gx-charcoal)', margin: '0 0 20px' }}>
          항목 수정
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 읽기 전용: 그룹 */}
          <div>
            <label style={labelStyle}>검사 그룹 (변경 불가)</label>
            <input value={item.item_group} disabled style={readonlyStyle} />
          </div>

          {/* 읽기 전용: 타입 */}
          <div>
            <label style={labelStyle}>타입 (변경 불가)</label>
            <input value={item.item_type} disabled style={readonlyStyle} />
          </div>

          {/* 읽기 전용: 역할 (ELEC만) */}
          {isElec && item.checker_role && (
            <div>
              <label style={labelStyle}>역할 (변경 불가)</label>
              <input value={item.checker_role} disabled style={readonlyStyle} />
            </div>
          )}

          {/* 수정 가능: 항목명 */}
          <div>
            <label style={labelStyle}>항목명 *</label>
            <input value={itemName} onChange={e => setItemName(e.target.value)} style={inputStyle} />
          </div>

          {/* 수정 가능: 기준/검사방법 */}
          <div>
            <label style={labelStyle}>기준/검사방법</label>
            <input value={description} onChange={e => setDescription(e.target.value)} style={inputStyle} />
          </div>

          {/* ELEC: 1차 배선 토글 (수정 가능) */}
          {isElec && (
            <div style={{ padding: '12px', background: 'var(--gx-cloud)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--gx-charcoal)', cursor: 'pointer' }}>
                <input type="checkbox" checked={phase1Applicable} onChange={e => setPhase1Applicable(e.target.checked)} />
                1차 배선 적용
              </label>
              {/* qi_check_required — 읽기 전용 */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--gx-steel)', opacity: 0.5 }}>
                <input type="checkbox" checked={item.qi_check_required ?? false} disabled />
                GST 확인 필요 (변경 불가 — 항목 추가 시에만 설정)
              </label>
            </div>
          )}

          {/* SELECT 타입: 선택지 수정 */}
          {item.item_type === 'SELECT' && (
            <div>
              <label style={labelStyle}>선택지 (쉼표 구분)</label>
              <input
                value={selectOptionsInput}
                onChange={e => setSelectOptionsInput(e.target.value)}
                placeholder="RED, BLUE, GREEN"
                style={inputStyle}
              />
            </div>
          )}

          {/* 수정 가능: 개정이력 */}
          <div>
            <label style={labelStyle}>개정이력 (remarks)</label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="2026-04 검사방법 변경"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px', borderRadius: '8px', border: '1px solid var(--gx-mist)',
              background: 'var(--gx-white)', color: 'var(--gx-slate)', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            }}
          >취소</button>
          <button
            onClick={handleSubmit}
            disabled={!itemName.trim()}
            style={{
              padding: '8px 20px', borderRadius: '8px', border: 'none',
              background: itemName.trim() ? 'var(--gx-accent)' : 'var(--gx-mist)',
              color: '#fff', fontSize: '13px', fontWeight: 600, cursor: itemName.trim() ? 'pointer' : 'not-allowed',
            }}
          >저장</button>
        </div>
      </div>
    </div>
  );
}
