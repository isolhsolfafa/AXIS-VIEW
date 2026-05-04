// src/components/checklist/ChecklistTable.tsx
// 체크리스트 마스터 항목 테이블 — Sprint 32 (ELEC Phase/QI 뱃지 + 행 클릭 수정)
// v1.35.2 (2026-04-25): canEdit prop — 협력사 읽기 전용 (행 클릭·토글 차단)

import type { ChecklistMasterItem } from '@/types/checklist';

interface ChecklistTableProps {
  items: ChecklistMasterItem[];
  showInactive: boolean;
  onToggleActive: (id: number, currentlyActive: boolean) => void;
  onEdit: (item: ChecklistMasterItem) => void;
  category: string;
  canEdit?: boolean;  // v1.35.2: 기본 true, false면 행 클릭·토글 비활성화
}

// 타입별 뱃지 스타일
const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  CHECK:  { bg: 'rgba(59,130,246,0.08)',  color: 'var(--gx-info)' },
  INPUT:  { bg: 'rgba(245,158,11,0.08)',  color: 'var(--gx-warning)' },
  SELECT: { bg: 'rgba(139,92,246,0.08)',  color: '#7c3aed' },
};

export default function ChecklistTable({ items, showInactive, onToggleActive, onEdit, category, canEdit = true }: ChecklistTableProps) {
  const filtered = showInactive ? items : items.filter(i => i.is_active);
  const isElec = category === 'ELEC';
  const isMech = category === 'MECH';   // Sprint 39 (v1.41.0)

  if (filtered.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-silver)', fontSize: '13px' }}>
        {items.length === 0 ? '등록된 항목이 없습니다' : '활성 항목이 없습니다'}
      </div>
    );
  }

  // 그룹별 색상 교대
  let prevGroup = '';
  let groupIdx = 0;
  let groupItemIdx = 0;

  const checkCount = filtered.filter(i => i.item_type === 'CHECK').length;
  const inputCount = filtered.filter(i => i.item_type === 'INPUT').length;
  const selectCount = filtered.filter(i => i.item_type === 'SELECT').length;
  const activeCount = filtered.filter(i => i.is_active).length;
  const inactiveCount = filtered.filter(i => !i.is_active).length;

  // 기본 컬럼
  const headers = ['#', '그룹', '항목명', '타입', '기준/검사방법'];
  // Sprint 39 (v1.41.0): ELEC + MECH — 카테고리 무관 일반 라벨
  if (isElec || isMech) headers.push('1차 적용', '역할');
  headers.push('활성');

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: 'var(--gx-cloud)' }}>
              {headers.map(h => (
                <th
                  key={h}
                  style={{
                    padding: '10px 12px', textAlign: 'left', fontSize: '11px',
                    fontWeight: 600, color: 'var(--gx-steel)', whiteSpace: 'nowrap',
                  }}
                >{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              if (item.item_group !== prevGroup) {
                groupIdx++;
                prevGroup = item.item_group;
                groupItemIdx = 0;
              }
              groupItemIdx++;
              const isEvenGroup = groupIdx % 2 === 0;
              const isQI = item.checker_role === 'QI';
              const typeCfg = TYPE_STYLE[item.item_type] ?? TYPE_STYLE.CHECK;

              return (
                <tr
                  key={item.id}
                  onClick={canEdit ? () => onEdit(item) : undefined}
                  title={!canEdit ? '편집 권한 없음 (협력사 읽기 전용)' : undefined}
                  style={{
                    borderBottom: '1px solid var(--gx-cloud)',
                    background: !item.is_active ? 'var(--gx-cloud)' : isEvenGroup ? 'var(--gx-snow, #FAFBFD)' : 'var(--gx-white)',
                    opacity: item.is_active ? 1 : 0.5,
                    cursor: canEdit ? 'pointer' : 'default',
                    // QI row 좌측 보라색 보더 — Sprint 39: MECH 도 동일 적용
                    borderLeft: (isElec || isMech) && isQI ? '3px solid var(--gx-accent)' : '3px solid transparent',
                  }}
                  onMouseEnter={canEdit ? (e => { e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }) : undefined}
                  onMouseLeave={canEdit ? (e => {
                    e.currentTarget.style.background = !item.is_active ? 'var(--gx-cloud)' : isEvenGroup ? 'var(--gx-snow, #FAFBFD)' : 'var(--gx-white)';
                  }) : undefined}
                >
                  <td style={{ padding: '9px 12px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--gx-steel)', fontSize: '11px' }}>
                    {groupItemIdx}
                  </td>
                  <td style={{ padding: '9px 12px', fontWeight: 600, color: 'var(--gx-charcoal)', whiteSpace: 'nowrap' }}>
                    {item.item_group}
                  </td>
                  <td style={{ padding: '9px 12px', color: 'var(--gx-charcoal)' }}>
                    {item.item_name}
                  </td>
                  <td style={{ padding: '9px 12px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                      background: typeCfg.bg, color: typeCfg.color,
                    }}>
                      {item.item_type}
                    </span>
                  </td>
                  <td style={{ padding: '9px 12px', color: 'var(--gx-slate)', fontSize: '11px' }}>
                    {item.description ?? '—'}
                  </td>
                  {/* Sprint 39 (v1.41.0): ELEC + MECH — 1차 적용 */}
                  {(isElec || isMech) && (
                    <td style={{ padding: '9px 12px', fontSize: '11px', color: 'var(--gx-slate)' }}>
                      {item.phase1_applicable ? '✅ 적용' : '—'}
                    </td>
                  )}
                  {/* Sprint 39 (v1.41.0): ELEC + MECH — 역할 */}
                  {(isElec || isMech) && (
                    <td style={{ padding: '9px 12px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                        background: isQI ? 'rgba(139,92,246,0.1)' : 'rgba(59,130,246,0.08)',
                        color: isQI ? '#7c3aed' : 'var(--gx-info)',
                      }}>
                        {isQI ? 'QI' : 'WORKER'}
                      </span>
                    </td>
                  )}
                  <td style={{ padding: '9px 12px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!canEdit) return;
                        onToggleActive(item.id, item.is_active);
                      }}
                      disabled={!canEdit}
                      title={!canEdit ? '편집 권한 없음 (협력사 읽기 전용)' : undefined}
                      style={{
                        width: '36px', height: '20px', borderRadius: '10px', border: 'none',
                        background: item.is_active ? 'var(--gx-success)' : 'var(--gx-mist)',
                        cursor: canEdit ? 'pointer' : 'not-allowed', position: 'relative', transition: 'background 0.2s',
                        opacity: canEdit ? 1 : 0.5,
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: '2px',
                        left: item.is_active ? '18px' : '2px',
                        width: '16px', height: '16px', borderRadius: '50%',
                        background: '#fff', transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 요약 */}
      <div style={{
        display: 'flex', gap: '16px', padding: '12px 0', fontSize: '11px', color: 'var(--gx-steel)',
      }}>
        <span>총 <b style={{ color: 'var(--gx-charcoal)' }}>{filtered.length}</b>개 항목</span>
        <span>CHECK <b style={{ color: 'var(--gx-info)' }}>{checkCount}</b></span>
        {inputCount > 0 && <span>INPUT <b style={{ color: 'var(--gx-warning)' }}>{inputCount}</b></span>}
        {selectCount > 0 && <span>SELECT <b style={{ color: '#7c3aed' }}>{selectCount}</b></span>}
        <span>활성 <b style={{ color: 'var(--gx-success)' }}>{activeCount}</b></span>
        {inactiveCount > 0 && <span>비활성 <b style={{ color: 'var(--gx-steel)' }}>{inactiveCount}</b></span>}
      </div>
    </div>
  );
}
