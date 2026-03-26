// src/components/checklist/ChecklistTable.tsx
// 체크리스트 마스터 항목 테이블 — Sprint 20

import type { ChecklistMasterItem } from '@/types/checklist';

interface ChecklistTableProps {
  items: ChecklistMasterItem[];
  showInactive: boolean;
  onToggleActive: (id: number, isActive: boolean) => void;
}

export default function ChecklistTable({ items, showInactive, onToggleActive }: ChecklistTableProps) {
  const filtered = showInactive ? items : items.filter(i => i.is_active);

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

  const checkCount = filtered.filter(i => i.item_type === 'CHECK').length;
  const inputCount = filtered.filter(i => i.item_type === 'INPUT').length;
  const activeCount = filtered.filter(i => i.is_active).length;
  const inactiveCount = filtered.filter(i => !i.is_active).length;

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: 'var(--gx-cloud)' }}>
              {['#', '그룹', '항목명', '타입', '기준/SPEC', '검사방법', '활성', '액션'].map(h => (
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
              if (item.inspection_group !== prevGroup) {
                groupIdx++;
                prevGroup = item.inspection_group;
              }
              const isEvenGroup = groupIdx % 2 === 0;

              return (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid var(--gx-cloud)',
                    background: !item.is_active ? 'var(--gx-cloud)' : isEvenGroup ? 'var(--gx-snow, #FAFBFD)' : 'var(--gx-white)',
                    opacity: item.is_active ? 1 : 0.5,
                  }}
                >
                  <td style={{ padding: '9px 12px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--gx-steel)', fontSize: '11px' }}>
                    {item.item_order}
                  </td>
                  <td style={{ padding: '9px 12px', fontWeight: 600, color: 'var(--gx-charcoal)', whiteSpace: 'nowrap' }}>
                    {item.inspection_group}
                  </td>
                  <td style={{ padding: '9px 12px', color: 'var(--gx-charcoal)' }}>
                    {item.item_name}
                  </td>
                  <td style={{ padding: '9px 12px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                      background: item.item_type === 'CHECK' ? 'var(--gx-info-bg, rgba(59,130,246,0.08))' : 'var(--gx-warning-bg, rgba(245,158,11,0.08))',
                      color: item.item_type === 'CHECK' ? 'var(--gx-info)' : 'var(--gx-warning)',
                    }}>
                      {item.item_type}
                    </span>
                  </td>
                  <td style={{ padding: '9px 12px', color: 'var(--gx-slate)', fontSize: '11px' }}>
                    {item.spec_criteria ?? '—'}
                  </td>
                  <td style={{ padding: '9px 12px', color: 'var(--gx-slate)', fontSize: '11px' }}>
                    {item.inspection_method ?? '—'}
                  </td>
                  <td style={{ padding: '9px 12px' }}>
                    <button
                      onClick={() => onToggleActive(item.id, !item.is_active)}
                      style={{
                        width: '36px', height: '20px', borderRadius: '10px', border: 'none',
                        background: item.is_active ? 'var(--gx-success)' : 'var(--gx-mist)',
                        cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
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
                  <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                    <button
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '14px', padding: '2px 4px',
                      }}
                      title="수정"
                    >✏️</button>
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
        <span>INPUT <b style={{ color: 'var(--gx-warning)' }}>{inputCount}</b></span>
        <span>활성 <b style={{ color: 'var(--gx-success)' }}>{activeCount}</b></span>
        {inactiveCount > 0 && <span>비활성 <b style={{ color: 'var(--gx-steel)' }}>{inactiveCount}</b></span>}
      </div>
    </div>
  );
}
