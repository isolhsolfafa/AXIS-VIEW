// src/components/checklist/ChecklistAddModal.tsx
// 체크리스트 항목 추가 모달 — Sprint 32 (그룹별 분기 자동추론 + SELECT 타입 + GROUP_POLICY)

import { useState, useEffect } from 'react';
import type { CreateMasterPayload, ItemType } from '@/types/checklist';

interface GroupPolicy {
  fixed: boolean;
  groups?: string[];
}

interface ChecklistAddModalProps {
  productCode: string;
  category: string;
  existingGroups: string[];
  groupPolicy?: GroupPolicy;
  onSubmit: (data: CreateMasterPayload) => void;
  onClose: () => void;
}

// ELEC 그룹별 기본값 매핑
const ELEC_GROUP_DEFAULTS: Record<string, { phase1: boolean; qi: boolean }> = {
  'PANEL 검사':                     { phase1: true,  qi: false },
  '조립 검사':                       { phase1: true,  qi: false },
  'JIG 검사 및 특별관리 POINT':      { phase1: false, qi: true  },
};

// Sprint 39 (v1.41.0): MECH 그룹별 기본값 매핑 — OPS Sprint 63-BE migration 051a v2 seed 기준
// INLET 단일 키 (master 8개로 분리됐지만 group 컬럼 단일)
const MECH_GROUP_DEFAULTS: Record<string, { phase1: boolean; qi: boolean }> = {
  'INLET':    { phase1: true,  qi: false },  // INLET S/N (DRAGON only)
  'GN2':      { phase1: true,  qi: false },  // Speed Controller + MFC
  'CDA':      { phase1: true,  qi: false },  // Speed Controller + MFC
  'LNG':      { phase1: true,  qi: false },  // MFC
  'O2':       { phase1: true,  qi: false },  // MFC
  'BCW':      { phase1: true,  qi: false },  // Flow Sensor
  'PCW-S':    { phase1: true,  qi: false },  // Flow Sensor
  'PCW-R':    { phase1: true,  qi: false },  // Flow Sensor
  // 그 외 그룹은 기본값 (phase1: false, qi: false) — 2차만 검수
};

// 카테고리별 타입 옵션
const TYPE_OPTIONS: Record<string, ItemType[]> = {
  TM:   ['CHECK'],
  ELEC: ['CHECK', 'SELECT'],
  MECH: ['CHECK', 'INPUT', 'SELECT'],   // Sprint 39: SELECT 추가 (MFC / Flow Sensor 드롭다운)
};

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  CHECK:  { bg: 'rgba(59,130,246,0.08)',  color: 'var(--gx-info)' },
  INPUT:  { bg: 'rgba(245,158,11,0.08)',  color: 'var(--gx-warning)' },
  SELECT: { bg: 'rgba(139,92,246,0.08)',  color: '#7c3aed' },
};

export default function ChecklistAddModal({
  productCode,
  category,
  existingGroups,
  groupPolicy,
  onSubmit,
  onClose,
}: ChecklistAddModalProps) {
  const isFixed = groupPolicy?.fixed ?? false;
  const fixedGroups = groupPolicy?.groups ?? existingGroups;
  const typeOptions = TYPE_OPTIONS[category] ?? ['CHECK'];
  const showTypeSelector = typeOptions.length > 1;
  const isElec = category === 'ELEC';
  const isMech = category === 'MECH';   // Sprint 39 (v1.41.0)

  const [groupMode, setGroupMode] = useState<'existing' | 'new'>('existing');
  const [group, setGroup] = useState(fixedGroups[0] ?? existingGroups[0] ?? '');
  const [newGroup, setNewGroup] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState<ItemType>(typeOptions[0]);
  const [description, setDescription] = useState('');
  const [selectOptionsInput, setSelectOptionsInput] = useState('');

  // ELEC 전용 토글
  const [phase1Applicable, setPhase1Applicable] = useState(true);
  const [qiCheckRequired, setQiCheckRequired] = useState(false);

  // 그룹 변경 시 ELEC 분기 자동 추론
  useEffect(() => {
    if (!isElec) return;
    const defaults = ELEC_GROUP_DEFAULTS[group];
    if (defaults) {
      setPhase1Applicable(defaults.phase1);
      setQiCheckRequired(defaults.qi);
    }
  }, [group, isElec]);

  // Sprint 39 (v1.41.0): MECH 그룹 변경 시 자동 추론 (ELEC 패턴 동일)
  useEffect(() => {
    if (!isMech) return;
    const defaults = MECH_GROUP_DEFAULTS[group];
    if (defaults) {
      setPhase1Applicable(defaults.phase1);
      setQiCheckRequired(defaults.qi);
    } else {
      setPhase1Applicable(false);   // 명시 안 된 그룹 = 2차만
      setQiCheckRequired(false);
    }
  }, [group, isMech]);

  const handleSubmit = () => {
    const finalGroup = (!isFixed && groupMode === 'new') ? newGroup.trim() : group;
    if (!finalGroup || !itemName.trim()) return;
    const payload: CreateMasterPayload = {
      product_code: productCode,
      category,
      item_group: finalGroup,
      item_name: itemName.trim(),
      item_type: itemType,
      description: description.trim() || undefined,
    };
    // Sprint 39 (v1.41.0): MECH 도 ELEC 와 동일 1차/2차 토글 패턴
    if (isElec || isMech) {
      payload.phase1_applicable = phase1Applicable;
      payload.qi_check_required = qiCheckRequired;
    }
    if (itemType === 'SELECT' && selectOptionsInput.trim()) {
      payload.select_options = selectOptionsInput.split(',').map(s => s.trim()).filter(Boolean);
    }
    onSubmit(payload);
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

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px',
    color: active ? 'var(--gx-charcoal)' : 'var(--gx-steel)', cursor: 'pointer',
  });

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
            {!isFixed && (
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
            )}
            {(isFixed || groupMode === 'existing') ? (
              <select value={group} onChange={e => setGroup(e.target.value)} style={inputStyle}>
                {(isFixed ? fixedGroups : existingGroups).map(g => <option key={g} value={g}>{g}</option>)}
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

          {/* 타입 — 카테고리별 분기 */}
          {showTypeSelector && (
            <div>
              <label style={labelStyle}>타입</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {typeOptions.map(t => {
                  const cfg = TYPE_STYLE[t];
                  return (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--gx-charcoal)', cursor: 'pointer' }}>
                      <input type="radio" checked={itemType === t} onChange={() => setItemType(t)} />
                      <span style={{
                        padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                        background: cfg.bg, color: cfg.color,
                      }}>{t}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* SELECT 선택지 입력 */}
          {itemType === 'SELECT' && (
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

          {/* 기준/검사방법 */}
          <div>
            <label style={labelStyle}>기준/검사방법</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="GAP GAUGE / 측수 검사" style={inputStyle} />
          </div>

          {/* Sprint 39 (v1.41.0): ELEC + MECH 양쪽 — 카테고리 무관 일반 라벨 */}
          {(isElec || isMech) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--gx-cloud)', borderRadius: '8px' }}>
              <label style={toggleStyle(phase1Applicable)}>
                <input type="checkbox" checked={phase1Applicable} onChange={e => setPhase1Applicable(e.target.checked)} />
                1차 입력 적용
              </label>
              <label style={toggleStyle(qiCheckRequired)}>
                <input type="checkbox" checked={qiCheckRequired} onChange={e => setQiCheckRequired(e.target.checked)} />
                QI 검사 필요
              </label>
              {qiCheckRequired && (
                <div style={{ fontSize: '11px', color: 'var(--gx-info)', padding: '4px 0 0 24px' }}>
                  ℹ️ JIG 항목은 서버에서 WORKER + QI 2행이 자동 생성됩니다.
                </div>
              )}
            </div>
          )}
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
