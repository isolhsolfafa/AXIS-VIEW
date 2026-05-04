// src/pages/checklist/ChecklistManagePage.tsx
// 체크리스트 관리 페이지 — Sprint 32 (EditModal 연동 + GROUP_POLICY)
// v1.35.2 (2026-04-25): 협력사(비-GST) 읽기 전용 — canEdit = is_admin || company === 'GST'

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import ChecklistFilterBar from '@/components/checklist/ChecklistFilterBar';
import ChecklistTable from '@/components/checklist/ChecklistTable';
import ChecklistAddModal from '@/components/checklist/ChecklistAddModal';
import ChecklistEditModal from '@/components/checklist/ChecklistEditModal';
import ChecklistSettingsPanel from '@/components/checklist/ChecklistSettingsPanel';
import { useChecklistMaster, useProductCodes, useCreateMaster, useToggleMaster, useUpdateMaster } from '@/hooks/useChecklistMaster';
import { useAuth } from '@/store/authStore';
import type { CreateMasterPayload, UpdateMasterPayload, ChecklistMasterItem } from '@/types/checklist';

// Sprint 39 (v1.41.0): MECH 활성화 — OPS Sprint 63-BE 배포 후 블러 해제
const BLUR_CATEGORIES = new Set<string>();

// GROUP_POLICY — 소유권 단일화: ManagePage에서만 정의, 모달에 prop 전달
const GROUP_POLICY: Record<string, { fixed: boolean; groups?: string[] }> = {
  TM:   { fixed: true, groups: ['BURNER', 'REACTOR', 'Exhaust', 'TANK'] },
  ELEC: { fixed: true, groups: ['PANEL 검사', '조립 검사', 'JIG 검사 및 특별관리 POINT'] },
  MECH: { fixed: false },
};

export default function ChecklistManagePage() {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TM');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistMasterItem | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // v1.35.2: 편집 권한 — admin 또는 GST 자사 소속만. 협력사(비-GST)는 읽기 전용
  const canEdit = (user?.is_admin ?? false) || user?.company === 'GST';

  // TM/ELEC → COMMON 자동 고정 (Sprint 31: ELEC도 COMMON scope)
  const effectiveProduct = (selectedCategory === 'TM' || selectedCategory === 'ELEC') ? 'COMMON' : selectedProduct;
  const isBlurred = BLUR_CATEGORIES.has(selectedCategory);

  const { data: productCodes } = useProductCodes();
  const { data, isLoading, dataUpdatedAt } = useChecklistMaster(selectedCategory, effectiveProduct, showInactive);
  const createMaster = useCreateMaster();
  const toggleMaster = useToggleMaster();
  const updateMaster = useUpdateMaster();

  const items = useMemo(() => {
    const raw = data?.items ?? [];
    // 그룹 순서: BE 원본에서 처음 등장하는 순서 유지
    const groupOrder = new Map<string, number>();
    for (const item of raw) {
      if (!groupOrder.has(item.item_group)) {
        groupOrder.set(item.item_group, groupOrder.size);
      }
    }
    return [...raw].sort((a, b) => {
      const ga = groupOrder.get(a.item_group) ?? 0;
      const gb = groupOrder.get(b.item_group) ?? 0;
      if (ga !== gb) return ga - gb;
      return a.item_order - b.item_order;
    });
  }, [data?.items]);

  const existingGroups = useMemo(() => {
    const groups = new Set(items.map(i => i.item_group));
    return Array.from(groups);
  }, [items]);

  const handleAdd = (payload: CreateMasterPayload) => {
    createMaster.mutate(payload, {
      onSuccess: () => toast.success('항목이 추가되었습니다'),
      onError: () => toast.error('추가에 실패했습니다'),
    });
    setShowAddModal(false);
  };

  const handleEdit = (id: number, data: UpdateMasterPayload) => {
    updateMaster.mutate({ id, data }, {
      onSuccess: () => {
        toast.success('항목이 수정되었습니다');
        setEditingItem(null);
      },
      onError: () => toast.error('수정에 실패했습니다'),
    });
  };

  const handleToggleActive = (id: number, currentlyActive: boolean) => {
    const label = currentlyActive ? '비활성화' : '활성화';
    const item = items.find(i => i.id === id);
    const itemLabel = item ? `[${item.item_group}] ${item.item_name}` : `항목 #${id}`;

    if (!confirm(`${itemLabel}\n\n${label} 하시겠습니까?`)) return;

    toggleMaster.mutate(id, {
      onSuccess: () => toast.success(`${itemLabel} — ${label} 완료`),
      onError: () => toast.error(`${label}에 실패했습니다`),
    });
  };

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  return (
    <Layout title="체크리스트 관리" lastUpdated={lastUpdated}>
      {/* 상단 필터 + 액션 */}
      <div style={{
        background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg, 14px)',
        boxShadow: 'var(--shadow-card, 0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04))',
        padding: '20px 24px', marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <ChecklistFilterBar
            productCodes={productCodes ?? []}
            selectedProduct={selectedProduct}
            onProductChange={setSelectedProduct}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            hideProductDropdown={selectedCategory === 'TM' || selectedCategory === 'ELEC'}
          />

          <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--gx-steel)', cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={showInactive}
                onChange={e => setShowInactive(e.target.checked)}
                disabled={isBlurred}
              />
              비활성 포함
            </label>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={isBlurred || !effectiveProduct || !canEdit}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                background: !isBlurred && effectiveProduct && canEdit ? 'var(--gx-accent)' : 'var(--gx-mist)',
                color: '#fff', fontSize: '13px', fontWeight: 600,
                cursor: !isBlurred && effectiveProduct && canEdit ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
              title={!canEdit ? '편집 권한 없음 (협력사 읽기 전용)' : undefined}
            >
              + 항목 추가
            </button>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setSettingsOpen(prev => !prev)}
                disabled={isBlurred || !canEdit}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '36px', height: '36px', borderRadius: 'var(--radius-gx-md, 10px)',
                  border: `1px solid ${settingsOpen ? 'var(--gx-accent)' : 'var(--gx-mist)'}`,
                  background: settingsOpen ? 'rgba(99,102,241,0.08)' : 'var(--gx-white)',
                  cursor: (isBlurred || !canEdit) ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
                  color: settingsOpen ? 'var(--gx-accent)' : 'var(--gx-slate)',
                  opacity: (isBlurred || !canEdit) ? 0.5 : 1,
                }}
                title={!canEdit ? '편집 권한 없음 (협력사 읽기 전용)' : 'TM 체크리스트 설정'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
              </button>
              <ChecklistSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
            </div>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div style={{
        background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg, 14px)',
        boxShadow: 'var(--shadow-card, 0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04))',
        padding: '16px 20px', position: 'relative',
      }}>
        {/* MECH 블러 오버레이 */}
        {isBlurred && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--radius-gx-lg, 14px)',
          }}>
            <div style={{
              textAlign: 'center', padding: '40px',
              background: 'var(--gx-white)', borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)', marginBottom: '4px' }}>
                {selectedCategory} 체크리스트 준비중
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gx-steel)' }}>
                항목 확정 후 활성화 예정
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gx-steel)', fontSize: '13px' }}>
            로딩 중...
          </div>
        ) : (
          <ChecklistTable
            items={items}
            showInactive={showInactive}
            onToggleActive={handleToggleActive}
            onEdit={(item) => setEditingItem(item)}
            category={selectedCategory}
            canEdit={canEdit}
          />
        )}
      </div>

      {/* 추가 모달 */}
      {showAddModal && effectiveProduct && (
        <ChecklistAddModal
          productCode={effectiveProduct}
          category={selectedCategory}
          existingGroups={existingGroups}
          groupPolicy={GROUP_POLICY[selectedCategory]}
          onSubmit={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* 수정 모달 */}
      {editingItem && (
        <ChecklistEditModal
          item={editingItem}
          category={selectedCategory}
          onSubmit={(data) => handleEdit(editingItem.id, data)}
          onClose={() => setEditingItem(null)}
        />
      )}
    </Layout>
  );
}
