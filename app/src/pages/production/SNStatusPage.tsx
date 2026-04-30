// src/pages/production/SNStatusPage.tsx
// S/N 작업 현황 카드뷰 페이지 — Sprint 18 / Sprint 37(O/N 그룹 인라인 토글) / Sprint 38(모델별 카운트 칩)

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import SNCard from '@/components/sn-status/SNCard';
import SNDetailPanel from '@/components/sn-status/SNDetailPanel';
import SNStatusSettingsPanel from '@/components/sn-status/SNStatusSettingsPanel';
import InProgressModelChips from '@/components/sn-status/InProgressModelChips';
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
  // Sprint 38 (Codex M1): 칩 정확매칭 필터 — search 부분매칭과 분리
  const [modelFilter, setModelFilter] = useState('');
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

    // 검색 필터 (부분매칭 — O/N · S/N · 모델명)
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.serial_number.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        (p.sales_order && p.sales_order.toLowerCase().includes(q)),
      );
    }

    // Sprint 38: 모델 칩 필터 (정확매칭 — 칩 클릭으로만 적용, search 와 분리)
    if (modelFilter) {
      result = result.filter(p => p.model.trim() === modelFilter);
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
  }, [products, search, modelFilter, isAdminOrGst, user?.company, settings.showTestSN]);

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

  // Sprint 38: 진행 중 모델별 카운트 (search/modelFilter 미적용 baseline — Codex #A self-referential UI 회피)
  // - search 와 modelFilter 둘 다 deps 에서 의도적 제외
  // - 칩 자체는 항상 모든 진행 모델 노출 (필터 적용 후에도 다른 칩으로 전환 가능)
  // - Codex A4: 모델 키 정규화 (p.model.trim()) — BE 데이터의 공백/대소문자 변형 안전
  const inProgressByModel = useMemo(() => {
    let result = products;
    if (!settings.showTestSN) {
      result = result.filter(p => !TEST_SN_PREFIXES.some(pfx => p.serial_number.startsWith(pfx)));
    }
    if (!isAdminOrGst && user?.company) {
      const cats = COMPANY_CATEGORIES[user.company];
      if (cats) {
        result = result.filter(p => cats.some(c => p.categories[c] != null));
      }
    }
    const map = new Map<string, number>();
    for (const p of result) {
      if (p.overall_percent > 0 && !p.all_completed) {
        const key = p.model.trim();
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [products, isAdminOrGst, user?.company, settings.showTestSN]);

  const totalInProgress = useMemo(
    () => inProgressByModel.reduce((sum, [, n]) => sum + n, 0),
    [inProgressByModel]
  );

  // Sprint 37: O/N 그룹 인라인 토글 — 다대 그룹은 헤더 클릭으로 펼침/접힘
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  // search 가 실제로 변경된 시점만 자동 펼침에 반영 — groupedByON 재참조 시 race 방지
  const lastProcessedSearchRef = useRef<string>('');
  // Sprint 38: modelFilter 자동 펼침 — 칩 클릭 시점만 처리 (Sprint 37 패턴 동일)
  const lastProcessedModelFilterRef = useRef<string>('');

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // [Effect 1] 검색 자동 펼침 — search 변경 시점만 처리 (수동 접기 우선)
  useEffect(() => {
    const currentSearch = search.trim();
    if (currentSearch === lastProcessedSearchRef.current) return;
    lastProcessedSearchRef.current = currentSearch;
    if (currentSearch.length === 0) return;
    setExpandedGroups(prev => {
      const next = new Set(prev);
      const q = currentSearch.toLowerCase();
      for (const g of groupedByON) {
        if (g.products.some(p =>
          p.serial_number.toLowerCase().includes(q) ||
          (p.sales_order ?? '').toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q)
        )) {
          next.add(g.key);
        }
      }
      return next;
    });
  }, [search, groupedByON]);

  // [Effect 2] 상세 패널 열린 S/N 의 부모 그룹 자동 펼침 — idempotent
  useEffect(() => {
    if (!selectedSN) return;
    const ownerGroup = groupedByON.find(g =>
      g.products.some(p => p.serial_number === selectedSN)
    );
    if (!ownerGroup) return;
    setExpandedGroups(prev => {
      if (prev.has(ownerGroup.key)) return prev;
      const next = new Set(prev);
      next.add(ownerGroup.key);
      return next;
    });
  }, [selectedSN, groupedByON]);

  // [Effect 3] Stale group key cleanup — BE 데이터 변경으로 사라진 key 정리
  useEffect(() => {
    const validKeys = new Set(groupedByON.map(g => g.key));
    setExpandedGroups(prev => {
      const filtered = new Set([...prev].filter(k => validKeys.has(k)));
      return filtered.size === prev.size ? prev : filtered;
    });
  }, [groupedByON]);

  // [Effect 4] Sprint 38: modelFilter 자동 펼침 — 칩 클릭 시 매치 그룹 자동 펼침 (Sprint 37 검색 effect 와 동일 race 방지 패턴)
  useEffect(() => {
    if (modelFilter === lastProcessedModelFilterRef.current) return;
    lastProcessedModelFilterRef.current = modelFilter;
    if (modelFilter === '') return; // 칩 해제 시 펼침 상태 유지
    setExpandedGroups(prev => {
      const next = new Set(prev);
      for (const g of groupedByON) {
        if (g.products.some(p => p.model.trim() === modelFilter)) {
          next.add(g.key);
        }
      }
      return next;
    });
  }, [modelFilter, groupedByON]);

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
          placeholder="O/N · S/N · 모델명 검색 (부분매칭)"
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

      {/* Sprint 38: 진행 중 모델별 카운트 칩 (검색바 아래, 카드 그리드 위) */}
      <InProgressModelChips
        items={inProgressByModel}
        activeModel={modelFilter}
        total={totalInProgress}
        onToggle={(m) => setModelFilter(prev => prev === m ? '' : m)}
      />

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
          {groupedByON.map(group => {
            // v1.36.1: O/N 그룹 통일 토글 — salesOrder 있는 모든 그룹(단대/다대) 동일하게 클릭 토글
            // O/N 없음 그룹(`_no_on_{sn}`)은 헤더 자체가 없어 토글 대상 아님 → 항상 노출
            const hasHeader = !!group.salesOrder;
            const expanded = expandedGroups.has(group.key);
            const showCards = !hasHeader || expanded;
            return (
              <div key={group.key}>
                {hasHeader && (
                  <div
                    onClick={() => toggleGroup(group.key)}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--gx-mist)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--gx-white)')}
                    role="button"
                    aria-expanded={expanded}
                    aria-label={`O/N ${group.salesOrder} ${group.products.length}대 그룹 ${expanded ? '접기' : '펼치기'}`}
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleGroup(group.key);
                      }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', marginBottom: '12px',
                      background: 'var(--gx-white)',
                      borderRadius: 'var(--radius-gx-md, 10px)',
                      boxShadow: 'var(--shadow-card)',
                      border: '1px solid var(--gx-mist)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {expanded
                        ? <ChevronDown size={14} style={{ color: 'var(--gx-steel)' }} />
                        : <ChevronRight size={14} style={{ color: 'var(--gx-steel)' }} />
                      }
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

                {/* SNCard 그리드 — 헤더 없거나 펼친 상태에서만 */}
                {showCards && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px',
                    ...(hasHeader && expanded && {
                      paddingLeft: '12px',
                      borderLeft: '2px solid var(--gx-mist)',
                      marginBottom: '16px',
                    }),
                  }}>
                    {group.products.map(p => (
                      <SNCard
                        key={p.serial_number}
                        product={p}
                        isSelected={selectedSN === p.serial_number}
                        onClick={handleCardClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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
