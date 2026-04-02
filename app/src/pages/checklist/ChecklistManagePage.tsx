// src/pages/checklist/ChecklistManagePage.tsx
// 체크리스트 관리 페이지 — Sprint 26 (TM 활성화 + MECH/ELEC 블러)

import { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import ChecklistFilterBar from '@/components/checklist/ChecklistFilterBar';
import ChecklistTable from '@/components/checklist/ChecklistTable';
import ChecklistAddModal from '@/components/checklist/ChecklistAddModal';
import ChecklistSettingsPanel from '@/components/checklist/ChecklistSettingsPanel';
import { useChecklistMaster, useProductCodes, useCreateMaster, useToggleMaster } from '@/hooks/useChecklistMaster';
import type { CreateMasterPayload } from '@/types/checklist';

const BLUR_CATEGORIES = new Set(['MECH', 'ELEC']);

export default function ChecklistManagePage() {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TM');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // TM → COMMON 자동 고정
  const effectiveProduct = selectedCategory === 'TM' ? 'COMMON' : selectedProduct;
  const isBlurred = BLUR_CATEGORIES.has(selectedCategory);

  const { data: productCodes } = useProductCodes();
  const { data, isLoading, dataUpdatedAt } = useChecklistMaster(selectedCategory, effectiveProduct);
  const createMaster = useCreateMaster();
  const toggleMaster = useToggleMaster();

  const items = data?.items ?? [];

  const existingGroups = useMemo(() => {
    const groups = new Set(items.map(i => i.item_group));
    return Array.from(groups);
  }, [items]);

  const handleAdd = (payload: CreateMasterPayload) => {
    createMaster.mutate(payload);
    setShowAddModal(false);
  };

  const handleToggleActive = (id: number) => {
    toggleMaster.mutate(id);
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
            hideProductDropdown={selectedCategory === 'TM'}
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
              disabled={isBlurred || !effectiveProduct}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                background: !isBlurred && effectiveProduct ? 'var(--gx-accent)' : 'var(--gx-mist)',
                color: '#fff', fontSize: '13px', fontWeight: 600,
                cursor: !isBlurred && effectiveProduct ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
            >
              + 항목 추가
            </button>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setSettingsOpen(prev => !prev)}
                disabled={isBlurred}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '36px', height: '36px', borderRadius: 'var(--radius-gx-md, 10px)',
                  border: `1px solid ${settingsOpen ? 'var(--gx-accent)' : 'var(--gx-mist)'}`,
                  background: settingsOpen ? 'rgba(99,102,241,0.08)' : 'var(--gx-white)',
                  cursor: isBlurred ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
                  color: settingsOpen ? 'var(--gx-accent)' : 'var(--gx-slate)',
                  opacity: isBlurred ? 0.5 : 1,
                }}
                title="TM 체크리스트 설정"
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
        {/* MECH/ELEC 블러 오버레이 */}
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
            category={selectedCategory}
          />
        )}
      </div>

      {/* 추가 모달 */}
      {showAddModal && effectiveProduct && (
        <ChecklistAddModal
          productCode={effectiveProduct}
          category={selectedCategory}
          existingGroups={existingGroups}
          onSubmit={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </Layout>
  );
}
