// src/components/checklist/ChecklistOptionMapModal.tsx
// 체크리스트 자재 매핑 모달 — Sprint 42 (M-NEW-3 round-trip — legacy string[] | 신규 number[] union)
// admin/GST 가 SELECT 타입 항목에 자재 매핑 (material_id 배열 + 순서 보존)

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { listMaterials } from '@/api/materials';
import { getChecklistMasterOptions, updateChecklistMasterOptions } from '@/api/checklist';

const GAS_OPTIONS = ['전체', 'LNG', 'CDA', 'O2', 'N2'] as const;

interface Props {
  masterId: number;
  itemName: string;
  onClose: () => void;
}

export default function ChecklistOptionMapModal({ masterId, itemName, onClose }: Props) {
  const queryClient = useQueryClient();

  const [searchCategory, setSearchCategory] = useState('MFC');  // 기본 MFC (가스 분기 가장 빈번)
  const [searchKeyword, setSearchKeyword] = useState('');
  const [gasFilter, setGasFilter] = useState<typeof GAS_OPTIONS[number]>('전체');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);  // 순서 보존 (배열)

  // ESC 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── 현재 매핑 로드 ──
  const { data: optionsData, isLoading: optionsLoading } = useQuery({
    queryKey: ['checklist-options', masterId],
    queryFn: () => getChecklistMasterOptions(masterId),
  });

  // M-NEW-3 round-trip: legacy string[] | 신규 number[] union 분기
  const isLegacy = useMemo(() => {
    const raw = optionsData?.select_options_raw ?? [];
    if (raw.length === 0) return false;  // 빈 배열은 신규 가정
    return typeof raw[0] === 'string';
  }, [optionsData]);

  // 매핑 초기 로드 — number[] 일 때만 selectedIds 적용
  useEffect(() => {
    if (!optionsData) return;
    if (typeof optionsData.select_options_raw[0] === 'number') {
      setSelectedIds(optionsData.select_options_raw as number[]);
    } else {
      setSelectedIds([]);
    }
  }, [optionsData]);

  // ── 자재 검색 ──
  const { data: materialsData } = useQuery({
    queryKey: ['materials-search', { category: searchCategory, keyword: searchKeyword, gas: gasFilter }],
    queryFn: () => listMaterials({
      category: searchCategory || undefined,
      keyword: searchKeyword || undefined,
      description: gasFilter === '전체' ? undefined : gasFilter,
      page: 1,
      per_page: 100,
    }),
    staleTime: 30_000,
  });

  const materials = materialsData?.items ?? [];

  // 검색 결과 + 이미 선택된 자재 (검색 범위 밖에 있어도 표시)
  const allSelectedMaterials = useMemo(() => {
    const fromSearch = materials.filter(m => selectedIds.includes(m.id));
    const fromExisting = (optionsData?.materials ?? []).filter(m => selectedIds.includes(m.id) && !fromSearch.some(s => s.id === m.id));
    return [...fromSearch, ...fromExisting];
  }, [materials, selectedIds, optionsData]);

  const toggleMaterial = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const moveUp = (id: number) => {
    setSelectedIds(prev => {
      const idx = prev.indexOf(id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const moveDown = (id: number) => {
    setSelectedIds(prev => {
      const idx = prev.indexOf(id);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  const saveMutation = useMutation({
    mutationFn: () => updateChecklistMasterOptions(masterId, selectedIds),
    onSuccess: () => {
      toast.success(`${selectedIds.length}개 자재 매핑이 저장되었습니다.`);
      queryClient.invalidateQueries({ queryKey: ['checklist-options', masterId] });
      // Sprint 42 hotfix v1.43.1 (Codex [신규-2]): master 목록 cache invalidate
      // 실제 query key = useChecklistMaster.ts L16 의 ['checklist', 'master', ...] (Sprint 42 결함 정정)
      queryClient.invalidateQueries({ queryKey: ['checklist', 'master'] });
      onClose();
    },
    onError: () => toast.error('매핑 저장 중 오류가 발생했습니다.'),
  });

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="optmap-title" style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 id="optmap-title" style={titleStyle}>"{itemName}" 자재 매핑</h2>

        {isLegacy && (
          <div style={legacyWarnStyle}>
            ⚠️ 기존 placeholder string 배열이 있습니다. 저장 시 material_id 배열로 전환됩니다 (legacy 데이터 덮어쓰기).
          </div>
        )}

        {/* 검색 바 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            placeholder="카테고리"
            style={{ ...inputStyle, width: '120px' }}
          />
          <select value={gasFilter} onChange={(e) => setGasFilter(e.target.value as typeof GAS_OPTIONS[number])} style={{ ...inputStyle, width: '120px' }}>
            {GAS_OPTIONS.map(g => <option key={g} value={g}>가스: {g}</option>)}
          </select>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="maker / spec 검색..."
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>

        {/* 검색 결과 */}
        <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--gx-mist)', borderRadius: '6px', marginBottom: '12px' }}>
          {optionsLoading ? (
            <p style={emptyStyle}>로딩 중...</p>
          ) : materials.length === 0 ? (
            <p style={emptyStyle}>검색 결과가 없습니다</p>
          ) : (
            <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
              <tbody>
                {materials.map(m => {
                  const checked = selectedIds.includes(m.id);
                  const isDisabled = !m.is_active;
                  return (
                    <tr key={m.id} style={{ borderTop: '1px solid var(--gx-mist)', opacity: isDisabled ? 0.5 : 1 }}>
                      <td style={{ ...tdStyle, width: '32px' }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleMaterial(m.id)} disabled={isDisabled} />
                      </td>
                      <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', monospace", width: '100px' }}>{m.item_code}</td>
                      <td style={tdStyle}>
                        {m.item_name}{m.spec_1 ? ` | ${m.spec_1}` : ''}{m.spec_2 ? ` | ${m.spec_2}` : ''}
                        {m.description && <span style={{ marginLeft: '6px', padding: '1px 6px', background: 'var(--gx-cloud)', borderRadius: '3px', fontSize: '10px' }}>[{m.description}]</span>}
                        {!m.is_active && <span style={{ marginLeft: '6px', color: 'var(--gx-steel)', fontSize: '10px' }}>(비활성)</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* 선택된 자재 + 순서 변경 */}
        <div style={selectedBoxStyle}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gx-slate)', marginBottom: '6px' }}>
            선택된 {selectedIds.length} 자재 (순서대로 dropdown 노출)
          </div>
          {selectedIds.length === 0 ? (
            <p style={{ fontSize: '11px', color: 'var(--gx-steel)', margin: 0 }}>아직 선택된 자재가 없습니다.</p>
          ) : (
            <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: 'var(--gx-charcoal)' }}>
              {selectedIds.map((id, idx) => {
                const m = allSelectedMaterials.find(x => x.id === id);
                if (!m) return <li key={id}><em style={{ color: 'var(--gx-steel)' }}>(자재 ID {id} — 검색 범위 밖)</em></li>;
                return (
                  <li key={id} style={{ marginBottom: '2px' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{m.item_code}</span> {m.item_name}
                    <button type="button" onClick={() => moveUp(id)} disabled={idx === 0} style={orderBtnStyle}>▲</button>
                    <button type="button" onClick={() => moveDown(id)} disabled={idx === selectedIds.length - 1} style={orderBtnStyle}>▼</button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
          <button type="button" onClick={onClose} style={btnSecondaryStyle}>취소</button>
          <button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || selectedIds.length === 0} style={btnPrimaryStyle}>
            {saveMutation.isPending ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalStyle: React.CSSProperties = { background: 'var(--gx-white)', borderRadius: '12px', padding: '24px', width: '640px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' };
const titleStyle: React.CSSProperties = { fontSize: '16px', fontWeight: 600, color: 'var(--gx-charcoal)', margin: '0 0 12px 0' };
const legacyWarnStyle: React.CSSProperties = { padding: '8px 12px', background: 'rgba(245,158,11,0.1)', border: '1px solid var(--gx-warning)', borderRadius: '6px', fontSize: '12px', color: 'var(--gx-charcoal)', marginBottom: '12px' };
const inputStyle: React.CSSProperties = { padding: '6px 10px', fontSize: '12px', border: '1px solid var(--gx-mist)', borderRadius: '6px', boxSizing: 'border-box' };
const tdStyle: React.CSSProperties = { padding: '6px 8px' };
const emptyStyle: React.CSSProperties = { padding: '20px', textAlign: 'center', color: 'var(--gx-steel)', fontSize: '12px', margin: 0 };
const selectedBoxStyle: React.CSSProperties = { padding: '10px 12px', background: 'var(--gx-snow)', borderRadius: '6px' };
const orderBtnStyle: React.CSSProperties = { marginLeft: '4px', padding: '0 4px', fontSize: '10px', border: '1px solid var(--gx-mist)', borderRadius: '3px', background: 'var(--gx-white)', cursor: 'pointer' };
const btnSecondaryStyle: React.CSSProperties = { padding: '8px 16px', fontSize: '13px', fontWeight: 500, border: '1px solid var(--gx-mist)', borderRadius: '6px', background: 'var(--gx-white)', color: 'var(--gx-charcoal)', cursor: 'pointer' };
const btnPrimaryStyle: React.CSSProperties = { padding: '8px 16px', fontSize: '13px', fontWeight: 500, border: 'none', borderRadius: '6px', background: 'var(--gx-accent)', color: 'white', cursor: 'pointer' };
