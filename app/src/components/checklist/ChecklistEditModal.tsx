// src/components/checklist/ChecklistEditModal.tsx
// 체크리스트 항목 수정 모달 — Sprint 32 (qi_check_required 읽기 전용)
// Sprint 42 hotfix v1.43.1: SELECT 타입 자재 매핑 영역 통합 (방향 A — 자재코드 input + FE Map 변환 → number[] PATCH)
// v1.43.4 (2026-05-11): Codex 사후 검토 M-01 (dirty flag) + M-02 (SELECT 최소 1자재 invariant) fix

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { listMaterials } from '@/api/materials';
import { updateChecklistMasterOptions } from '@/api/checklist';
import ChecklistOptionMapModal from '@/components/checklist/ChecklistOptionMapModal';
import type { Material } from '@/api/materials';
import type { ChecklistMasterItem, UpdateMasterPayload } from '@/types/checklist';

interface ChecklistEditModalProps {
  item: ChecklistMasterItem;
  category: string;
  onSubmit: (data: UpdateMasterPayload) => void | Promise<void>;  // Sprint 42 hotfix: async 지원
  onClose: () => void;
}

export default function ChecklistEditModal({ item, category, onSubmit, onClose }: ChecklistEditModalProps) {
  const isElec = category === 'ELEC';
  const isMech = category === 'MECH';   // Sprint 39 (v1.41.0)
  const queryClient = useQueryClient();

  const [itemName, setItemName] = useState(item.item_name);
  const [description, setDescription] = useState(item.description ?? '');
  const [phase1Applicable, setPhase1Applicable] = useState(item.phase1_applicable ?? true);
  const [selectOptionsInput, setSelectOptionsInput] = useState(
    item.select_options?.join(', ') ?? ''
  );
  const [remarks, setRemarks] = useState(item.remarks ?? '');
  const [showMapModal, setShowMapModal] = useState(false);
  const [hydrated, setHydrated] = useState(false);  // Sprint 42 hotfix: hydrate 1회 flag (사용자 입력 덮어쓰기 차단)
  const [selectDirty, setSelectDirty] = useState(false);  // v1.43.4 (M-01): 사용자가 자재코드 input 을 한 번이라도 건드리면 true → late hydrate skip

  // Sprint 42 hotfix: 전체 자재 캐시 (5분) — SELECT 타입만 호출
  const { data: allMaterialsRes } = useQuery({
    queryKey: ['materials', { page: 1, per_page: 200 }],
    queryFn: () => listMaterials({ page: 1, per_page: 200 }),
    staleTime: 5 * 60 * 1000,
    enabled: item.item_type === 'SELECT',
  });
  const allMaterials = allMaterialsRes?.items ?? [];

  // Sprint 42 hotfix (Codex [8] 정정): hydrate useEffect — numeric id[] → item_code[] 변환
  // hydrated flag 로 1회 처리 (사용자 입력 덮어쓰기 차단)
  // legacy string[] → 빈 input (admin 자재코드 재입력 영역)
  // v1.43.4 (Codex M-01): selectDirty 추가 가드 — late hydrate 시점에 사용자 입력 이미 있으면 hydrate skip
  useEffect(() => {
    if (hydrated) return;
    if (item.item_type !== 'SELECT') {
      setHydrated(true);
      return;
    }
    // v1.43.4 M-01: 사용자가 이미 input 을 건드렸으면 late hydrate 차단 (입력 덮어쓰기 방지)
    if (selectDirty) {
      setHydrated(true);
      return;
    }
    const raw = item.select_options ?? [];
    if (raw.length === 0) {
      setSelectOptionsInput('');
      setHydrated(true);
      return;
    }
    if (raw.every(x => typeof x === 'number')) {
      // 신규 number[] → item_code[] 변환 (allMaterials 로드 후 1회)
      if (allMaterials.length === 0) return;  // 자재 데이터 미로드 시 대기
      const idMap = new Map(allMaterials.map(m => [m.id, m.item_code]));
      const codes = (raw as number[]).map(id => idMap.get(id)).filter(Boolean) as string[];
      setSelectOptionsInput(codes.join(', '));
      setHydrated(true);
    } else {
      // legacy string[] → 빈 input (방향 A 단일 양식, admin 재매핑 영역)
      setSelectOptionsInput('');
      setHydrated(true);
    }
  }, [hydrated, selectDirty, item.item_type, item.select_options, allMaterials]);

  // Sprint 42 hotfix: debounce + client-side filter
  const debouncedInput = useDebounce(selectOptionsInput, 500);

  const { matched, missing } = useMemo(() => {
    if (item.item_type !== 'SELECT' || !debouncedInput.trim()) {
      return { matched: [] as Material[], missing: [] as string[] };
    }
    const codes = debouncedInput.split(',').map(s => s.trim()).filter(Boolean);
    if (codes.length === 0 || allMaterials.length === 0) {
      return { matched: [] as Material[], missing: [] as string[] };
    }
    // v1.43.8: case-insensitive 비교 (codeMap key/lookup 모두 toLowerCase 정규화)
    // missing 배열은 원본 입력 보존 (사용자가 입력한 값 그대로 표시)
    const codeMap = new Map(allMaterials.map(m => [m.item_code.toLowerCase(), m]));
    const m: Material[] = [];
    const miss: string[] = [];
    codes.forEach(c => {
      const mat = codeMap.get(c.toLowerCase());
      if (mat) m.push(mat); else miss.push(c);
    });
    return { matched: m, missing: miss };
  }, [debouncedInput, allMaterials, item.item_type]);

  // Sprint 42 hotfix (Codex [1] 정정): hasPendingSelectChange — union 정규화
  const hasPendingSelectChange = useMemo(() => {
    if (item.item_type !== 'SELECT' || matched.length === 0 || missing.length > 0) return false;
    const raw = item.select_options ?? [];
    if (raw.length === 0) return matched.length > 0;
    if (raw.every(x => typeof x === 'number')) {
      return JSON.stringify(matched.map(m => m.id)) !== JSON.stringify(raw);
    }
    return true;  // legacy string[] = 항상 pending (admin 재매핑)
  }, [item.item_type, item.select_options, matched, missing]);

  // Sprint 42 hotfix: updateOptionsMutation — onSuccess invalidate (+ master cache, Codex [신규-2])
  const updateOptionsMutation = useMutation({
    mutationFn: (materialIds: number[]) =>
      updateChecklistMasterOptions(item.id, materialIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-options', item.id] });
      queryClient.invalidateQueries({ queryKey: ['checklist', 'master'] });
    },
    onError: () => toast.error('자재 매핑 저장 실패 — 잠시 후 다시 시도해주세요.'),
  });

  // Sprint 42 hotfix (Codex [2] 정정): Promise.all 패턴 (race 차단)
  const handleSubmit = async () => {
    if (!itemName.trim()) return;

    // SELECT 타입 매핑 검증 (옵션 C 강제)
    if (item.item_type === 'SELECT' && selectOptionsInput.trim()) {
      if (missing.length > 0) {
        toast.error(`미등록 자재: ${missing.join(', ')} — 자재 마스터 등록 후 재시도`);
        return;
      }
      if (matched.length === 0 && allMaterials.length > 0) {
        toast.error('최소 1자재 매핑 필요 (옵션 C)');
        return;
      }
    }

    // v1.43.4 (Codex M-02): SELECT 항목 최소 1자재 invariant 강제
    // - hasPendingSelectChange 면 matched.length 가 최종 매핑 수 (위 검증이 잡음)
    // - 매핑 변경 의도 없으면 기존 select_options 길이로 판단 — 0이면 차단
    if (item.item_type === 'SELECT' && !hasPendingSelectChange) {
      const existingCount = (item.select_options ?? []).length;
      if (existingCount === 0) {
        toast.error('SELECT 항목은 최소 1자재 매핑이 필요합니다 — 자재코드를 입력 후 저장하세요.');
        return;
      }
    }

    const data: UpdateMasterPayload = {};
    if (itemName.trim() !== item.item_name) data.item_name = itemName.trim();
    if (description.trim() !== (item.description ?? '')) data.description = description.trim() || undefined;
    // Sprint 39 (v1.41.0): MECH 도 ELEC 와 동일 1차 토글 패턴
    if ((isElec || isMech) && phase1Applicable !== (item.phase1_applicable ?? true)) data.phase1_applicable = phase1Applicable;
    if (remarks.trim() !== (item.remarks ?? '')) data.remarks = remarks.trim() || undefined;

    // 변경사항 없으면 그냥 닫기
    if (Object.keys(data).length === 0 && !hasPendingSelectChange) {
      onClose();
      return;
    }

    // Promise.all 패턴 — 일반 필드 + SELECT 매핑 동시 처리 + 완료 후 onClose
    const tasks: Promise<unknown>[] = [];
    if (Object.keys(data).length > 0) {
      const result = onSubmit(data);
      if (result instanceof Promise) tasks.push(result);
    }
    if (hasPendingSelectChange) {
      tasks.push(updateOptionsMutation.mutateAsync(matched.map(m => m.id)));
    }

    try {
      await Promise.all(tasks);
      onClose();
    } catch (err) {
      console.error('handleSubmit 실패:', err);
      // 모달 유지 — toast 는 caller / mutation onError 에서 처리
    }
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

          {/* 읽기 전용: 역할 (ELEC + MECH) */}
          {(isElec || isMech) && item.checker_role && (
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

          {/* Sprint 39 (v1.41.0): ELEC + MECH 양쪽 — 1차 입력 적용 토글 (수정 가능) + QI 검사 필요 (읽기 전용) */}
          {(isElec || isMech) && (
            <div style={{ padding: '12px', background: 'var(--gx-cloud)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--gx-charcoal)', cursor: 'pointer' }}>
                <input type="checkbox" checked={phase1Applicable} onChange={e => setPhase1Applicable(e.target.checked)} />
                1차 입력 적용
              </label>
              {/* qi_check_required — 읽기 전용 */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--gx-steel)', opacity: 0.5 }}>
                <input type="checkbox" checked={item.qi_check_required ?? false} disabled />
                QI 검사 필요 (변경 불가 — 항목 추가 시에만 설정)
              </label>
            </div>
          )}

          {/* Sprint 42 hotfix v1.43.1: SELECT 타입 자재 매핑 영역 (방향 A) */}
          {item.item_type === 'SELECT' && (
            <div>
              <label style={labelStyle}>선택지 (자재코드, 쉼표 구분) *</label>

              {/* ① 자재코드 직접 입력 — v1.43.4 (M-01): onChange 시 selectDirty=true 트리거 */}
              <input
                value={selectOptionsInput}
                onChange={e => {
                  setSelectOptionsInput(e.target.value);
                  if (!selectDirty) setSelectDirty(true);
                }}
                placeholder="1110006700, 1120094300, 1110298800"
                style={inputStyle}
              />

              {/* ② [🔍 자재 검색 도움] 버튼 — ChecklistOptionMapModal 호출 (보조) */}
              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                style={{
                  marginTop: '6px', padding: '4px 10px', borderRadius: '6px',
                  border: '1px solid var(--gx-mist)', color: 'var(--gx-slate)',
                  background: 'var(--gx-white)', fontSize: '11px', cursor: 'pointer',
                }}
              >
                🔍 자재 검색 도움 (자재코드 모를 때)
              </button>

              {/* ③ debounce + client-side filter spec 표시 */}
              {(matched.length > 0 || missing.length > 0) && (
                <div style={{ marginTop: '8px', padding: '8px', background: 'var(--gx-cloud)', borderRadius: '6px', fontSize: '11px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--gx-slate)' }}>
                    ⓘ 자재 정보:
                  </div>
                  {matched.map(mat => (
                    <div key={mat.id} style={{ padding: '2px 0', color: 'var(--gx-charcoal)' }}>
                      ✓ {mat.item_code} = {mat.item_name} | {mat.spec_1 ?? '—'} | {mat.spec_2 ?? '—'}
                      {!mat.is_active && <span style={{ color: 'var(--gx-warning)', marginLeft: '4px' }}>[비활성]</span>}
                    </div>
                  ))}
                  {missing.map(code => (
                    <div key={code} style={{ padding: '2px 0', color: 'var(--gx-danger)' }}>
                      ✗ {code} = 미등록 자재 (자재 마스터 등록 후 재시도)
                    </div>
                  ))}
                </div>
              )}

              {/* ④ ChecklistOptionMapModal 보조 영역 */}
              {showMapModal && (
                <ChecklistOptionMapModal
                  masterId={item.id}
                  itemName={item.item_name}
                  onClose={() => setShowMapModal(false)}
                />
              )}
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
