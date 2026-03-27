// src/pages/production/SNStatusPage.tsx
// S/N 작업 현황 카드뷰 페이지 — Sprint 18

import { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import SNCard from '@/components/sn-status/SNCard';
import SNDetailPanel from '@/components/sn-status/SNDetailPanel';
import { useSNProgress } from '@/hooks/useSNProgress';
import { useSNTasks } from '@/hooks/useSNTasks';
import { useAuth } from '@/store/authStore';
import type { SNProduct } from '@/types/snStatus';

// 협력사 company → 담당 카테고리 매핑 (BE _build_company_filter 기준)
const COMPANY_CATEGORIES: Record<string, string[]> = {
  FNI: ['MECH'],
  BAT: ['MECH'],
  'TMS(M)': ['MECH', 'TMS'],
  'TMS(E)': ['ELEC'],
  'P&S': ['ELEC'],
  'C&A': ['ELEC'],
};

export default function SNStatusPage() {
  const { user } = useAuth();
  const isAdminOrGst = user?.is_admin || user?.company === 'GST';

  const { data, isLoading, refetch, isFetching, dataUpdatedAt } = useSNProgress();
  const [search, setSearch] = useState('');
  const [selectedSN, setSelectedSN] = useState<string | null>(null);
  const { data: tasks, isLoading: tasksLoading } = useSNTasks(selectedSN);

  const products = data?.products ?? [];

  const selectedProduct = useMemo(
    () => products.find(p => p.serial_number === selectedSN) ?? null,
    [products, selectedSN],
  );

  // 검색 + 권한 필터 → 정렬
  const sorted = useMemo(() => {
    let result = products;

    // 협력사: 자사 담당 공정이 있는 S/N만 표시
    if (!isAdminOrGst && user?.company) {
      const cats = COMPANY_CATEGORIES[user.company];
      if (cats) {
        result = result.filter(p => cats.some(c => p.categories[c] != null));
      }
    }

    // 검색 필터
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.serial_number.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q),
      );
    }

    // 정렬: 진행중 > 대기 > 완료
    const rank = (p: SNProduct) =>
      p.overall_percent > 0 && !p.all_completed ? 0
        : !p.all_completed ? 1
          : 2;

    return [...result].sort((a, b) => {
      const diff = rank(a) - rank(b);
      if (diff !== 0) return diff;
      const aKey = a.last_activity_at ?? a.ship_plan_date ?? '';
      const bKey = b.last_activity_at ?? b.ship_plan_date ?? '';
      return bKey.localeCompare(aKey);
    });
  }, [products, search, isAdminOrGst, user?.company]);

  const handleCardClick = (sn: string) => {
    setSelectedSN(prev => prev === sn ? null : sn);
  };

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  return (
    <Layout title="S/N 작업 현황" lastUpdated={lastUpdated}>
      {/* 검색 + 새로고침 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="S/N · 모델명 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1,
            maxWidth: '400px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-gx-md, 10px)',
            border: '1px solid var(--gx-mist)',
            fontSize: '13px',
            color: 'var(--gx-charcoal)',
            background: 'var(--gx-white)',
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--gx-accent)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--gx-mist)'; }}
        />
        <span style={{
          fontSize: '10px', color: 'var(--gx-silver)',
          fontFamily: "'JetBrains Mono', monospace",
          flexShrink: 0,
        }}>
          {dataUpdatedAt ? `동기화 ${new Date(dataUpdatedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}` : '—'}
        </span>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '28px', height: '28px', borderRadius: '8px',
            border: '1px solid var(--gx-mist)', background: 'var(--gx-white)',
            cursor: isFetching ? 'default' : 'pointer',
            transition: 'all 0.15s',
            opacity: isFetching ? 0.5 : 1,
            flexShrink: 0,
          }}
          title="새로고침"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gx-slate)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }}>
            <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
        </button>
      </div>

      {/* 카드 그리드 */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: 'var(--gx-cloud)',
                borderRadius: 'var(--radius-gx-md, 10px)',
                height: '200px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gx-silver)', fontSize: '14px' }}>
          {search ? '검색 결과가 없습니다' : '표시할 S/N이 없습니다'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {sorted.map(p => (
            <SNCard
              key={p.serial_number}
              product={p}
              isSelected={selectedSN === p.serial_number}
              onClick={handleCardClick}
            />
          ))}
        </div>
      )}

      {/* 상세 패널 */}
      {selectedSN && selectedProduct && (
        <SNDetailPanel
          serialNumber={selectedSN}
          product={selectedProduct}
          tasks={tasks ?? []}
          isLoading={tasksLoading}
          onClose={() => setSelectedSN(null)}
        />
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );
}
