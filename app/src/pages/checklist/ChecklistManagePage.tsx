// src/pages/checklist/ChecklistManagePage.tsx
// 체크리스트 관리 페이지 — Sprint 20

import { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import ChecklistFilterBar from '@/components/checklist/ChecklistFilterBar';
import ChecklistTable from '@/components/checklist/ChecklistTable';
import ChecklistAddModal from '@/components/checklist/ChecklistAddModal';
import ChecklistSettingsPanel from '@/components/checklist/ChecklistSettingsPanel';
import { useChecklistMaster, useProductCodes, useCreateMaster, useUpdateMaster } from '@/hooks/useChecklistMaster';
import type { CreateMasterPayload } from '@/types/checklist';

export default function ChecklistManagePage() {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('MECH');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: productCodes } = useProductCodes();
  const { data, isLoading, dataUpdatedAt } = useChecklistMaster(selectedCategory, selectedProduct);
  const createMaster = useCreateMaster();
  const updateMaster = useUpdateMaster();

  const items = data?.items ?? [];

  const existingGroups = useMemo(() => {
    const groups = new Set(items.map(i => i.inspection_group));
    return Array.from(groups);
  }, [items]);

  const handleAdd = (payload: CreateMasterPayload) => {
    createMaster.mutate(payload);
    setShowAddModal(false);
  };

  const handleToggleActive = (id: number, isActive: boolean) => {
    updateMaster.mutate({ id, data: { is_active: isActive } });
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
          />

          <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--gx-steel)', cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={showInactive}
                onChange={e => setShowInactive(e.target.checked)}
              />
              비활성 포함
            </label>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={!selectedProduct}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                background: selectedProduct ? 'var(--gx-accent)' : 'var(--gx-mist)',
                color: '#fff', fontSize: '13px', fontWeight: 600,
                cursor: selectedProduct ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
            >
              + 항목 추가
            </button>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setSettingsOpen(prev => !prev)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '36px', height: '36px', borderRadius: 'var(--radius-gx-md, 10px)',
                  border: `1px solid ${settingsOpen ? 'var(--gx-accent)' : 'var(--gx-mist)'}`,
                  background: settingsOpen ? 'rgba(99,102,241,0.08)' : 'var(--gx-white)',
                  cursor: 'pointer', transition: 'all 0.15s',
                  color: settingsOpen ? 'var(--gx-accent)' : 'var(--gx-slate)',
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
        padding: '16px 20px',
      }}>
        {!selectedProduct ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gx-silver)', fontSize: '14px' }}>
            Product Code를 선택하세요
          </div>
        ) : isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gx-steel)', fontSize: '13px' }}>
            로딩 중...
          </div>
        ) : (
          <>
            {/* 2차판정 토글 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px',
              padding: '8px 12px', background: 'var(--gx-cloud)', borderRadius: '8px',
            }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
                2차판정 필요
              </span>
              <span style={{ fontSize: '11px', color: 'var(--gx-steel)' }}>
                (second_judgment_required)
              </span>
              <button
                style={{
                  width: '36px', height: '20px', borderRadius: '10px', border: 'none',
                  background: data?.second_judgment_required ? 'var(--gx-success)' : 'var(--gx-mist)',
                  cursor: 'pointer', position: 'relative', transition: 'background 0.2s', marginLeft: '4px',
                }}
              >
                <span style={{
                  position: 'absolute', top: '2px',
                  left: data?.second_judgment_required ? '18px' : '2px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
              <span style={{ fontSize: '10px', color: 'var(--gx-steel)', marginLeft: 'auto' }}>
                목업 — BE 연동 후 동작
              </span>
            </div>

            <ChecklistTable
              items={items}
              showInactive={showInactive}
              onToggleActive={handleToggleActive}
            />
          </>
        )}
      </div>

      {/* 추가 모달 */}
      {showAddModal && selectedProduct && (
        <ChecklistAddModal
          productCode={selectedProduct}
          category={selectedCategory}
          existingGroups={existingGroups}
          onSubmit={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </Layout>
  );
}
