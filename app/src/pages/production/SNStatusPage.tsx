// src/pages/production/SNStatusPage.tsx
// S/N 작업 현황 카드뷰 페이지 — Sprint 18

import { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import SNCard from '@/components/sn-status/SNCard';
import SNDetailPanel from '@/components/sn-status/SNDetailPanel';
import SNStatusSettingsPanel from '@/components/sn-status/SNStatusSettingsPanel';
import { useSNProgress } from '@/hooks/useSNProgress';
import { useSNTasks } from '@/hooks/useSNTasks';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/store/authStore';
import type { SNProduct } from '@/types/snStatus';

// 테스트 S/N 필터 — DOC_TEST- prefix 숨김 (TODO: 추후 설정 on/off 전환)
const TEST_SN_PREFIXES = ['DOC_TEST-', 'TEST-'];

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
  const { settings, updateSetting } = useSettings();
  const [search, setSearch] = useState('');
  const [selectedSN, setSelectedSN] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { data: tasks, isLoading: tasksLoading } = useSNTasks(selectedSN);

  const products = data?.products ?? [];

  const selectedProduct = useMemo(
    () => products.find(p => p.serial_number === selectedSN) ?? null,
    [products, selectedSN],
  );

  // 검색 + 권한 필터 → 정렬
  const sorted = useMemo(() => {
    let result = products;

    // 테스트 S/N 숨김 (설정에 따라)
    if (!settings.showTestSN) {
      result = result.filter(p => !TEST_SN_PREFIXES.some(pfx => p.serial_number.startsWith(pfx)));
    }

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
        p.model.toLowerCase().includes(q) ||
        (p.sales_order && p.sales_order.toLowerCase().includes(q)),
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
  }, [products, search, isAdminOrGst, user?.company, settings.showTestSN]);

  // O/N별 그룹핑 — Sprint 24
  // Sprint 34 (FE-21, v1.33.0): lineLabel 집계 추가 — 최빈값 + "외 N" (NULL row는 혼재 카운트 제외)
  const groupedByON = useMemo(() => {
    const groups: {
      key: string;
      salesOrder: string;
      model: string;
      customer: string;
      products: SNProduct[];
      overallPercent: number;
      lineLabel: string | null;
    }[] = [];
    const map = new Map<string, typeof groups[0]>();

    for (const p of sorted) {
      const key = p.sales_order ?? `_no_on_${p.serial_number}`;
      if (!map.has(key)) {
        const group = {
          key,
          salesOrder: p.sales_order ?? '',
          model: p.model,
          customer: p.customer,
          products: [] as SNProduct[],
          overallPercent: 0,
          lineLabel: null as string | null,
        };
        map.set(key, group);
        groups.push(group);
      }
      map.get(key)!.products.push(p);
    }

    for (const g of groups) {
      g.overallPercent = Math.round(
        g.products.reduce((sum, p) => sum + p.overall_percent, 0) / g.products.length
      );

      // FE-21: line 혼재 집계 — NULL row는 validCount에서 제외 (혼재로 오산하지 않도록)
      const counts = new Map<string, number>();
      let validCount = 0;
      for (const s of g.products) {
        const l = s.line?.trim();
        if (l) {
          counts.set(l, (counts.get(l) ?? 0) + 1);
          validCount++;
        }
      }
      if (counts.size > 0) {
        const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
        const [topLine, topCount] = sorted[0];
        const mixedCount = validCount - topCount;
        g.lineLabel = mixedCount > 0 ? `${topLine} 외 ${mixedCount}` : topLine;
      }
    }
    return groups;
  }, [sorted]);

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
          placeholder="O/N · S/N · 모델명 검색"
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
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setSettingsOpen(prev => !prev)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '28px', height: '28px', borderRadius: '8px',
              border: `1px solid ${settingsOpen ? 'var(--gx-accent)' : 'var(--gx-mist)'}`,
              background: settingsOpen ? 'rgba(99,102,241,0.08)' : 'var(--gx-white)',
              cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
              color: settingsOpen ? 'var(--gx-accent)' : 'var(--gx-slate)',
            }}
            title="설정"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
          <SNStatusSettingsPanel
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            settings={settings}
            onUpdate={updateSetting}
          />
        </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {groupedByON.map(group => (
            <div key={group.key}>
              {/* O/N 섹션 헤더 */}
              {group.salesOrder && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 4px', marginBottom: '12px',
                  borderBottom: '1px solid var(--gx-mist)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
                      O/N {group.salesOrder}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--gx-steel)' }}>
                      {group.model} · {group.customer}
                      {group.lineLabel && ` · ${group.lineLabel}`}
                      {' · '}{group.products.length}대
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '60px', height: '5px', borderRadius: '3px', background: 'var(--gx-cloud)' }}>
                      <div style={{
                        width: `${group.overallPercent}%`, height: '100%', borderRadius: '3px',
                        background: group.overallPercent === 100 ? 'var(--gx-success)' : 'var(--gx-accent)',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                    <span style={{
                      fontSize: '12px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                      color: group.overallPercent === 100 ? 'var(--gx-success)' : 'var(--gx-charcoal)',
                    }}>
                      {group.overallPercent}%
                    </span>
                  </div>
                </div>
              )}

              {/* SNCard 그리드 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {group.products.map(p => (
                  <SNCard
                    key={p.serial_number}
                    product={p}
                    isSelected={selectedSN === p.serial_number}
                    onClick={handleCardClick}
                  />
                ))}
              </div>
            </div>
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
          canReactivate={user?.is_admin || user?.is_manager || false}
          canForceClose={user?.is_admin || user?.is_manager || false}
          currentUserCompany={user?.company}
          isAdmin={user?.is_admin || false}
        />
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );
}
