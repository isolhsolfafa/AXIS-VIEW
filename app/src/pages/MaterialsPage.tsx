// src/pages/MaterialsPage.tsx
// 자재 마스터 관리 페이지 — Sprint 42 (FEAT-AXIS-VIEW-MATERIALS-AND-CHECKLISTS-MGMT-20260507)
// 권한: admin 또는 GST 전직원 (App.tsx allowedRoles=['admin','gst'])

import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import MaterialFormModal from '@/components/materials/MaterialFormModal';
import MaterialUploadModal from '@/components/materials/MaterialUploadModal';
import MaterialDeactivateConfirm from '@/components/materials/MaterialDeactivateConfirm';
import { listMaterials } from '@/api/materials';
import type { Material } from '@/api/materials';

const PER_PAGE = 50;
// v1.43.9: 가스 → Util 명칭 변경 + Flow sensor 영역 4종 추가 (PCW-R/BCW/TANK/DRAIN)
const UTIL_OPTIONS = ['전체', 'LNG', 'CDA', 'O2', 'N2', 'PCW-R', 'BCW', 'TANK', 'DRAIN'] as const;

export default function MaterialsPage() {
  const queryClient = useQueryClient();

  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [gasFilter, setGasFilter] = useState<typeof UTIL_OPTIONS[number]>('전체');
  const [page, setPage] = useState(1);

  const [editingItem, setEditingItem] = useState<Material | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deactivatingItem, setDeactivatingItem] = useState<Material | null>(null);

  // ── 자재 목록 query (TanStack Query — A-NEW-1 정합) ──
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['materials', { category, keyword, gas: gasFilter, page }],
    queryFn: () =>
      listMaterials({
        category: category || undefined,
        keyword: keyword || undefined,
        description: gasFilter === '전체' ? undefined : gasFilter,  // BE ILIKE '%LNG%'
        page,
        per_page: PER_PAGE,
      }),
    staleTime: 60_000,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  // ── 카테고리 옵션 (응답에서 unique 추출) ──
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const m of items) {
      if (m.category) set.add(m.category);
    }
    return [...set].sort();
  }, [items]);

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['materials'] });
  };

  return (
    <Layout>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--gx-charcoal)', margin: 0 }}>
            자재 마스터 관리
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--gx-steel)', marginTop: '4px' }}>
            체크리스트 SELECT 옵션 매핑용 자재 (BE Sprint 66-BE 연동)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              border: '1px solid var(--gx-mist)',
              borderRadius: 'var(--radius-gx-md, 8px)',
              background: 'var(--gx-white)',
              color: 'var(--gx-charcoal)',
              cursor: 'pointer',
            }}
          >
            📤 Excel 업로드
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              border: 'none',
              borderRadius: 'var(--radius-gx-md, 8px)',
              background: 'var(--gx-accent)',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            + 추가
          </button>
        </div>
      </div>

      {/* 검색 바 */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          padding: '12px 16px',
          background: 'var(--gx-white)',
          borderRadius: 'var(--radius-gx-md, 10px)',
          marginBottom: '16px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          style={{
            padding: '6px 10px',
            fontSize: '13px',
            border: '1px solid var(--gx-mist)',
            borderRadius: 'var(--radius-gx-sm, 6px)',
            background: 'var(--gx-white)',
          }}
        >
          <option value="">카테고리 (전체)</option>
          {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Util 필터 (description ILIKE — Sprint 42 5-08 추가, v1.43.9 가스→Util) */}
        <select
          value={gasFilter}
          onChange={(e) => { setGasFilter(e.target.value as typeof UTIL_OPTIONS[number]); setPage(1); }}
          style={{
            padding: '6px 10px',
            fontSize: '13px',
            border: '1px solid var(--gx-mist)',
            borderRadius: 'var(--radius-gx-sm, 6px)',
            background: 'var(--gx-white)',
          }}
        >
          {UTIL_OPTIONS.map(g => <option key={g} value={g}>Util: {g}</option>)}
        </select>

        <input
          type="text"
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          placeholder="자재내역 / 자재코드 검색..."
          style={{
            flex: 1,
            padding: '6px 10px',
            fontSize: '13px',
            border: '1px solid var(--gx-mist)',
            borderRadius: 'var(--radius-gx-sm, 6px)',
            background: 'var(--gx-white)',
          }}
        />

        <span style={{ fontSize: '12px', color: 'var(--gx-steel)' }}>
          {total} 자재 중 {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)}
        </span>
      </div>

      {/* 테이블 */}
      <div style={{ background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-md, 10px)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gx-steel)', fontSize: '13px' }}>로딩 중...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gx-steel)', fontSize: '13px' }}>
            {keyword || category ? '검색 결과가 없습니다' : '등록된 자재가 없습니다'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'var(--gx-snow)', borderBottom: '1px solid var(--gx-mist)' }}>
                <th style={thStyle}>자재코드</th>
                <th style={thStyle}>자재내역</th>
                <th style={thStyle}>카테고리</th>
                <th style={thStyle}>규격1</th>
                <th style={thStyle}>규격2</th>
                <th style={thStyle}>Util</th>
                <th style={thStyle}>활성</th>
                <th style={thStyle}>작업</th>
              </tr>
            </thead>
            <tbody>
              {items.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--gx-mist)' }}>
                  <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', monospace" }}>{m.item_code}</td>
                  <td style={tdStyle}>{m.item_name}</td>
                  <td style={tdStyle}>{m.category ?? '—'}</td>
                  <td style={tdStyle}>{m.spec_1 ?? '—'}</td>
                  <td style={tdStyle}>{m.spec_2 ?? '—'}</td>
                  <td style={tdStyle}>{m.description ?? '—'}</td>
                  <td style={tdStyle}>
                    {m.is_active ? (
                      <span style={{ color: 'var(--gx-success)', fontSize: '11px' }}>● 활성</span>
                    ) : (
                      <span style={{ color: 'var(--gx-steel)', fontSize: '11px' }}>○ 비활성</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                    <button type="button" onClick={() => setEditingItem(m)} style={btnLinkStyle}>수정</button>
                    {m.is_active && (
                      <>
                        <span style={{ color: 'var(--gx-mist)', margin: '0 6px' }}>|</span>
                        <button type="button" onClick={() => setDeactivatingItem(m)} style={btnLinkDangerStyle}>비활성화</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
          <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pageBtnStyle(page === 1)}>‹ 이전</button>
          <span style={{ fontSize: '12px', color: 'var(--gx-steel)' }}>{page} / {totalPages}</span>
          <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={pageBtnStyle(page === totalPages)}>다음 ›</button>
          {isFetching && <span style={{ fontSize: '11px', color: 'var(--gx-steel)' }}>갱신 중...</span>}
        </div>
      )}

      {/* 모달들 */}
      {showAddModal && (
        <MaterialFormModal
          mode="create"
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { handleSuccess(); toast.success('자재가 추가되었습니다.'); setShowAddModal(false); }}
        />
      )}
      {editingItem && (
        <MaterialFormModal
          mode="edit"
          initial={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={() => { handleSuccess(); toast.success('자재가 수정되었습니다.'); setEditingItem(null); }}
        />
      )}
      {showUploadModal && (
        <MaterialUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => { handleSuccess(); setShowUploadModal(false); }}
        />
      )}
      {deactivatingItem && (
        <MaterialDeactivateConfirm
          material={deactivatingItem}
          onClose={() => setDeactivatingItem(null)}
          onSuccess={() => { handleSuccess(); setDeactivatingItem(null); }}
        />
      )}
    </Layout>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--gx-slate)',
};
const tdStyle: React.CSSProperties = {
  padding: '10px 12px', color: 'var(--gx-charcoal)',
};
const btnLinkStyle: React.CSSProperties = {
  padding: 0, border: 'none', background: 'transparent', color: 'var(--gx-accent)',
  fontSize: '12px', cursor: 'pointer', fontWeight: 500,
};
const btnLinkDangerStyle: React.CSSProperties = {
  padding: 0, border: 'none', background: 'transparent', color: 'var(--gx-danger)',
  fontSize: '12px', cursor: 'pointer', fontWeight: 500,
};
const pageBtnStyle = (disabled: boolean): React.CSSProperties => ({
  padding: '6px 14px', fontSize: '12px', fontWeight: 500,
  border: '1px solid var(--gx-mist)', borderRadius: 'var(--radius-gx-sm, 6px)',
  background: disabled ? 'var(--gx-cloud)' : 'var(--gx-white)',
  color: disabled ? 'var(--gx-steel)' : 'var(--gx-charcoal)',
  cursor: disabled ? 'not-allowed' : 'pointer',
});
