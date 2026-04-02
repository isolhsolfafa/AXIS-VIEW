// src/components/checklist/ChecklistAddModal.tsx
// 체크리스트 항목 추가 모달 — Sprint 26 (카테고리별 item_type 분기)

import { useState } from 'react';
import type { CreateMasterPayload } from '@/types/checklist';

interface ChecklistAddModalProps {
  productCode: string;
  category: string;
  existingGroups: string[];
  onSubmit: (data: CreateMasterPayload) => void;
  onClose: () => void;
}

// MECH만 INPUT 타입 존재, TM/ELEC은 CHECK 고정
const INPUT_CATEGORIES = new Set(['MECH']);

export default function ChecklistAddModal({
  productCode,
  category,
  existingGroups,
  onSubmit,
  onClose,
}: ChecklistAddModalProps) {
  const [groupMode, setGroupMode] = useState<'existing' | 'new'>('existing');
  const [group, setGroup] = useState(existingGroups[0] ?? '');
  const [newGroup, setNewGroup] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState<'CHECK' | 'INPUT'>('CHECK');
  const [description, setDescription] = useState('');

  const showItemType = INPUT_CATEGORIES.has(category);

  const handleSubmit = () => {
    const finalGroup = groupMode === 'new' ? newGroup.trim() : group;
    if (!finalGroup || !itemName.trim()) return;
    onSubmit({
      product_code: productCode,
      category,
      item_group: finalGroup,
      item_name: itemName.trim(),
      item_type: showItemType ? itemType : 'CHECK',
      description: description.trim() || undefined,
    });
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--gx-mist)',
    fontSize: '13px',
    color: 'var(--gx-charcoal)',
    background: 'var(--gx-white)',
    outline: 'none',
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: 600 as const,
    color: 'var(--gx-slate)',
    marginBottom: '4px',
    display: 'block' as const,
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
          항목 추가
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 그룹 */}
          <div>
            <label style={labelStyle}>검사 그룹</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
              <button
                onClick={() => setGroupMode('existing')}
                style={{
                  padding: '4px 10px', borderRadius: '6px', border: 'none', fontSize: '11px',
                  background: groupMode === 'existing' ? 'var(--gx-accent)' : 'var(--gx-cloud)',
                  color: groupMode === 'existing' ? '#fff' : 'var(--gx-slate)', cursor: 'pointer',
                }}
              >기존 그룹</button>
              <button
                onClick={() => setGroupMode('new')}
                style={{
                  padding: '4px 10px', borderRadius: '6px', border: 'none', fontSize: '11px',
                  background: groupMode === 'new' ? 'var(--gx-accent)' : 'var(--gx-cloud)',
                  color: groupMode === 'new' ? '#fff' : 'var(--gx-slate)', cursor: 'pointer',
                }}
              >신규 그룹</button>
            </div>
            {groupMode === 'existing' ? (
              <select value={group} onChange={e => setGroup(e.target.value)} style={inputStyle}>
                {existingGroups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            ) : (
              <input value={newGroup} onChange={e => setNewGroup(e.target.value)} placeholder="새 그룹명" style={inputStyle} />
            )}
          </div>

          {/* 항목명 */}
          <div>
            <label style={labelStyle}>항목명 *</label>
            <input value={itemName} onChange={e => setItemName(e.target.value)} placeholder="검사 항목명" style={inputStyle} />
          </div>

          {/* 타입 — MECH에서만 표시 */}
          {showItemType && (
            <div>
              <label style={labelStyle}>타입</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {(['CHECK', 'INPUT'] as const).map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--gx-charcoal)', cursor: 'pointer' }}>
                    <input type="radio" checked={itemType === t} onChange={() => setItemType(t)} />
                    <span style={{
                      padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                      background: t === 'CHECK' ? 'rgba(59,130,246,0.08)' : 'rgba(245,158,11,0.08)',
                      color: t === 'CHECK' ? 'var(--gx-info)' : 'var(--gx-warning)',
                    }}>{t}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 기준/검사방법 */}
          <div>
            <label style={labelStyle}>기준/검사방법</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="GAP GAUGE / 측수 검사" style={inputStyle} />
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
          >추가</button>
        </div>
      </div>
    </div>
  );
}
