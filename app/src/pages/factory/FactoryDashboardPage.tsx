// src/pages/factory/FactoryDashboardPage.tsx
// 공장 대시보드 — OPS Sprint 29 API 연동

import { useMemo, useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useWeeklyKpi, useMonthlyDetail, useMonthlyKpi } from '@/hooks/useFactory';
import { useEtlChanges } from '@/hooks/useEtlChanges';
import type { MonthlyKpiDateField, ShippedBasis } from '@/api/factory';
import KpiSwipeDeck from './components/KpiSwipeDeck';
import ProductionChart from './components/ProductionChart';
import FactoryDashboardSettingsPanel from './components/FactoryDashboardSettingsPanel';

// v1.35.0 Sprint 35 Phase 2: localStorage 키 (설비/모니터별 개별 설정)
const LS_SHIPPED_BASIS = 'axis_view_factory_shipped_basis';
const LS_MONTHLY_DATE_FIELD = 'axis_view_factory_monthly_date_field';

const MODEL_COLORS = [
  'linear-gradient(90deg, #6366F1, #818CF8)',
  'linear-gradient(90deg, #3B82F6, #60A5FA)',
  'linear-gradient(90deg, #10B981, #34D399)',
  'linear-gradient(90deg, #F59E0B, #FBBF24)',
  'linear-gradient(90deg, #8B5CF6, #A78BFA)',
  'linear-gradient(90deg, #EC4899, #F472B6)',
  'linear-gradient(90deg, #EF4444, #F87171)',
];

/* ── progress 색상 유틸 ─── */
function progressLevel(pct: number): { bar: string; text: string } {
  if (pct >= 80) return { bar: 'var(--gx-success)', text: 'var(--gx-success)' };
  if (pct >= 40) return { bar: 'var(--gx-warning)', text: 'var(--gx-warning)' };
  return { bar: 'var(--gx-danger)', text: 'var(--gx-danger)' };
}

/* ── 활동 피드 타입 + 색상 ─── */
interface FeedItem {
  id: string;
  type: 'etl' | 'progress' | 'defect';
  sn: string;
  label: string;
  detail: string;
  time: string;
  color: { bg: string; dot: string };
}

const FEED_COLORS: Record<string, { bg: string; dot: string }> = {
  ship_plan_date: { bg: 'rgba(59,130,246,0.08)', dot: '#3B82F6' },
  mech_start: { bg: 'rgba(16,185,129,0.08)', dot: '#10B981' },
  pi_start: { bg: 'rgba(236,72,153,0.08)', dot: '#EC4899' },
  mech_partner: { bg: 'rgba(139,92,246,0.08)', dot: '#8B5CF6' },
  elec_partner: { bg: 'rgba(245,158,11,0.08)', dot: '#F59E0B' },
  sales_order: { bg: 'rgba(99,102,241,0.08)', dot: '#6366F1' },
  progress_complete: { bg: 'rgba(16,185,129,0.08)', dot: '#10B981' },
  production_done: { bg: 'rgba(59,130,246,0.08)', dot: '#3B82F6' },
  shipped: { bg: 'rgba(16,185,129,0.08)', dot: '#10B981' },
  defect: { bg: 'rgba(239,68,68,0.08)', dot: '#EF4444' },
};

/* ── 상태 뱃지 ─── */
function statusOf(pct: number) {
  if (pct >= 100) return { label: '완료', bg: 'rgba(16,185,129,0.08)', color: 'var(--gx-success)' };
  if (pct > 0) return { label: '진행중', bg: 'rgba(59,130,246,0.08)', color: 'var(--gx-info)' };
  return { label: '초기', bg: 'rgba(245,158,11,0.08)', color: 'var(--gx-warning)' };
}

export default function FactoryDashboardPage() {
  // 근무시간(08~20시) 30분 자동 새로고침, 야간 비활성
  // 함수형 → 매 interval마다 현재 시각 재평가 (대형모니터 장시간 운용 대응)
  const autoRefreshInterval = () => {
    const h = new Date().getHours();
    return (h >= 8 && h < 20) ? 30 * 60 * 1000 : false;
  };
  const { data: kpi, isLoading: kpiLoading, dataUpdatedAt: kpiUpdatedAt, isFetching: kpiFetching, refetch: refetchKpi } = useWeeklyKpi({ refetchInterval: autoRefreshInterval });
  // v1.34.4 결정 (2026-04-23): date_field='mech_start' 영구 유지
  // 소비처 3곳 (생산 현황 상세 테이블 + 월간 생산 지표 차트 + 상단 스와이프 월간 ProductionChart)
  // 모두 "이번 달 기구 착수 S/N" 관점으로 관리.
  // 월간 생산량 카드만 별도로 Sprint 36 옵션 토글(mech_start/finishing_plan_end/ship_plan_date/actual_ship_date)로 기준 선택.
  const { data: monthly, isLoading: monthlyLoading, refetch: refetchMonthly } = useMonthlyDetail({ per_page: 500, date_field: 'mech_start', refetchInterval: autoRefreshInterval });
  const { data: etlData, refetch: refetchEtl } = useEtlChanges({ days: 7, limit: 10 });

  // Sprint 35: KPI 덱 주간/월간 전환 state
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  // v1.35.0 Phase 2: 출하 완료 / 월간 생산량 기준 토글 (localStorage 저장)
  const [shippedBasis, setShippedBasis] = useState<ShippedBasis>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(LS_SHIPPED_BASIS) : null;
    return (saved === 'plan' || saved === 'ops' || saved === 'actual') ? saved : 'actual';
  });
  const [monthlyDateField, setMonthlyDateField] = useState<MonthlyKpiDateField>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(LS_MONTHLY_DATE_FIELD) : null;
    const allowed: MonthlyKpiDateField[] = ['mech_start', 'finishing_plan_end', 'ship_plan_date', 'actual_ship_date'];
    return allowed.includes(saved as MonthlyKpiDateField) ? (saved as MonthlyKpiDateField) : 'mech_start';
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => { localStorage.setItem(LS_SHIPPED_BASIS, shippedBasis); }, [shippedBasis]);
  useEffect(() => { localStorage.setItem(LS_MONTHLY_DATE_FIELD, monthlyDateField); }, [monthlyDateField]);

  const { data: monthlyKpi, isLoading: monthlyKpiLoading, refetch: refetchMonthlyKpi } = useMonthlyKpi({
    enabled: period === 'monthly',
    refetchInterval: autoRefreshInterval,
    date_field: monthlyDateField,  // Phase 2: 토글 값 전달
  });

  const handleRefreshAll = () => { refetchKpi(); refetchMonthly(); refetchEtl(); refetchMonthlyKpi(); };
  const lastSync = kpiUpdatedAt ? new Date(kpiUpdatedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '—';

  /* ── 카테고리 필터 (localStorage 저장) ── */
  const ALL_CATEGORIES = ['MECH', 'ELEC', 'TMS', 'PI', 'QI', 'SI'] as const;
  const [viewCategories, setViewCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('axis_view_dashboard_categories');
      return saved ? JSON.parse(saved) : ['MECH', 'ELEC', 'TMS'];
    } catch { return ['MECH', 'ELEC', 'TMS']; }
  });
  const toggleCategory = (cat: string) => {
    setViewCategories(prev => {
      const next = prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat];
      localStorage.setItem('axis_view_dashboard_categories', JSON.stringify(next));
      return next;
    });
  };

  /* ── 자동 슬라이드 페이지네이션 (5건씩, 5초 간격) ── */
  const ITEMS_PER_SLIDE = 5;
  const [slidePage, setSlidePage] = useState(0);
  const [slideAutoPlay, setSlideAutoPlay] = useState(true);

  const sortedItems = useMemo(() => {
    if (!monthly?.items?.length) return [];
    return [...monthly.items].sort((a, b) => {
      if (!a.mech_start && !b.mech_start) return 0;
      if (!a.mech_start) return 1;
      if (!b.mech_start) return -1;
      return a.mech_start.localeCompare(b.mech_start);
    });
  }, [monthly]);

  const totalSlidePages = Math.max(1, Math.ceil(sortedItems.length / ITEMS_PER_SLIDE));
  const visibleItems = sortedItems.slice(slidePage * ITEMS_PER_SLIDE, (slidePage + 1) * ITEMS_PER_SLIDE);

  useEffect(() => {
    if (!slideAutoPlay || sortedItems.length <= ITEMS_PER_SLIDE) return;
    const timer = setInterval(() => {
      setSlidePage(prev => (prev + 1) % totalSlidePages);
    }, 5000);
    return () => clearInterval(timer);
  }, [sortedItems.length, totalSlidePages, slideAutoPlay]);

  // Sprint 35: 기존 kpiCards 배열 + chartData/maxCount는 KpiSwipeDeck / ProductionChart 컴포넌트로 이관 (공용화)

  const monthlyModels = useMemo(() => {
    if (!monthly?.by_model?.length) return [];
    const max = monthly.by_model[0].count || 1;
    return monthly.by_model.map((m, i) => ({
      ...m,
      pct: Math.round((m.count / max) * 100),
      colorClass: MODEL_COLORS[i % MODEL_COLORS.length],
    }));
  }, [monthly]);

  const stageData = useMemo(() => {
    if (!kpi?.by_stage) return [];
    const labels: Record<string, string> = { mech: '기구', elec: '전장', tm: 'TM', pi: '가압', qi: '공정', si: '마무리' };
    return Object.entries(kpi.by_stage).map(([key, val]) => ({
      label: labels[key] || key,
      value: val as number,
    }));
  }, [kpi]);

  /* ── 통합 활동 피드 (ETL 변경 + progress 완료 + defect 예정) ── */
  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];

    // ETL 변경 이벤트
    if (etlData?.changes) {
      for (const evt of etlData.changes) {
        const fc = FEED_COLORS[evt.field_name] || { bg: 'rgba(139,92,246,0.08)', dot: '#8B5CF6' };
        items.push({
          id: `etl-${evt.id}`,
          type: 'etl',
          sn: evt.serial_number,
          label: evt.field_label,
          detail: `${evt.old_value || '—'} → ${evt.new_value || '—'}`,
          time: evt.changed_at,
          color: fc,
        });
      }
    }

    // 생산완료 + 출하완료 이벤트
    if (monthly?.items) {
      for (const item of monthly.items) {
        // 기구+전장 생산완료 (mech_end & elec_end 모두 있으면)
        if (item.completion.mech && item.completion.elec && item.mech_end && item.elec_end) {
          const laterDate = item.mech_end > item.elec_end ? item.mech_end : item.elec_end;
          items.push({
            id: `prod-${item.serial_number}`,
            type: 'progress',
            sn: item.serial_number,
            label: '생산 완료',
            detail: `${item.model} · 기구+전장 완료`,
            time: laterDate,
            color: FEED_COLORS.production_done,
          });
        }

        // 출하 처리 완료 (전 공정 완료)
        if (item.progress_pct >= 100 && item.si_start) {
          items.push({
            id: `ship-${item.serial_number}`,
            type: 'progress',
            sn: item.serial_number,
            label: '출하 완료',
            detail: `${item.model} · 출하 처리 완료`,
            time: item.si_start,
            color: FEED_COLORS.shipped,
          });
        }
      }
    }

    // 시간순 정렬 (최신 먼저)
    items.sort((a, b) => b.time.localeCompare(a.time));
    return items.slice(0, 12);
  }, [etlData, monthly]);

  const isLoading = kpiLoading || monthlyLoading;

  return (
    <Layout title="공장 대시보드">
      <div style={{ padding: '28px 32px', maxWidth: '1440px' }}>

        {/* 동기화 표시 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: '10px', marginBottom: '16px',
        }}>
          <span style={{
            fontSize: '10px', color: 'var(--gx-silver)',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            동기화 {lastSync}
          </span>
          <button
            onClick={handleRefreshAll}
            disabled={kpiFetching}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '28px', height: '28px', borderRadius: '8px',
              border: '1px solid var(--gx-mist)', background: 'var(--gx-white)',
              cursor: kpiFetching ? 'default' : 'pointer',
              transition: 'all 0.15s',
              opacity: kpiFetching ? 0.5 : 1,
            }}
            title="새로고침"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gx-slate)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ animation: kpiFetching ? 'spin 1s linear infinite' : 'none' }}>
              <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </button>
          {/* v1.35.0 Phase 2: 설정 아이콘 (출하 / 월간 기준 토글) */}
          <button
            onClick={() => setShowSettings(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '28px', height: '28px', borderRadius: '8px',
              border: '1px solid var(--gx-mist)', background: 'var(--gx-white)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            title="대시보드 설정"
            aria-label="대시보드 설정"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gx-slate)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>

        {/* KPI Swipe Deck (주간/월간) — Sprint 35 + v1.34.5 30초 자동 + v1.35.0 shippedBasis 토글 */}
        <KpiSwipeDeck
          period={period}
          onPeriodChange={setPeriod}
          weekly={kpi}
          monthly={monthlyKpi}
          weeklyLoading={kpiLoading}
          monthlyLoading={monthlyKpiLoading}
          autoSwipeInterval={30000}
          shippedBasis={shippedBasis}
        />

        {/* v1.35.0 Phase 2: 설정 모달 (출하 기준 / 월간 date_field 토글) */}
        <FactoryDashboardSettingsPanel
          open={showSettings}
          onClose={() => setShowSettings(false)}
          shippedBasis={shippedBasis}
          onShippedBasisChange={setShippedBasis}
          monthlyDateField={monthlyDateField}
          onMonthlyDateFieldChange={setMonthlyDateField}
        />

        {/* Chart + Stage */}
        <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* Bar Chart — Sprint 35 period 연동 */}
          <ProductionChart
            period={period}
            weekly={kpi}
            monthlyDetail={monthly}
            isLoading={isLoading}
          />

          {/* Stage Completion */}
          <div style={{
            background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
            boxShadow: 'var(--shadow-card)', padding: '24px',
          }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)', marginBottom: '4px' }}>공정별 완료율</div>
            <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginBottom: '24px' }}>
              {kpi ? `W${kpi.week} 기준` : '—'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {stageData.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-slate)', width: '44px', textAlign: 'right', flexShrink: 0 }}>{s.label}</span>
                  <div style={{ flex: 1, height: '8px', background: 'var(--gx-cloud)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${s.value}%`, borderRadius: '4px',
                      background: s.value >= 80 ? 'var(--gx-success)' : s.value >= 40 ? 'var(--gx-warning)' : 'var(--gx-danger)',
                      transition: 'width 0.5s',
                    }} />
                  </div>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
                    fontWeight: 600, color: 'var(--gx-graphite)', minWidth: '40px',
                  }}>{s.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 생산 현황 상세 Table */}
        <div style={{
          background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)', overflow: 'hidden', marginBottom: '24px',
        }}>
          <div style={{ padding: '20px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>생산 현황 상세</div>
              <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>이번 달 기구시작 기준 정렬 · 총 {sortedItems.length}건</span>
                <span style={{ color: 'var(--gx-mist)' }}>|</span>
                {ALL_CATEGORIES.map(cat => (
                  <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={viewCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      style={{ width: '12px', height: '12px', accentColor: 'var(--gx-accent)', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '10px', fontWeight: 600, color: viewCategories.includes(cat) ? 'var(--gx-charcoal)' : 'var(--gx-silver)' }}>{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            {totalSlidePages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setSlideAutoPlay(prev => !prev)}
                  style={{
                    width: '28px', height: '28px', borderRadius: 'var(--radius-gx-sm)',
                    border: '1px solid var(--gx-mist)', background: 'var(--gx-cloud)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: slideAutoPlay ? 'var(--gx-accent)' : 'var(--gx-steel)',
                    transition: 'all 0.2s', marginRight: '4px',
                  }}
                  title={slideAutoPlay ? '자동 전환 정지' : '자동 전환 재생'}
                >
                  {slideAutoPlay ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <rect x="2" y="1" width="3" height="10" rx="0.5"/>
                      <rect x="7" y="1" width="3" height="10" rx="0.5"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M2.5 1.5v9l8-4.5z"/>
                    </svg>
                  )}
                </button>
                {Array.from({ length: totalSlidePages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlidePage(i)}
                    style={{
                      width: i === slidePage ? '20px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: i === slidePage ? 'var(--gx-accent)' : 'var(--gx-mist)',
                      transition: 'all 0.3s',
                    }}
                  />
                ))}
                <span style={{
                  fontSize: '11px', color: 'var(--gx-steel)', marginLeft: '8px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {slidePage + 1}/{totalSlidePages}
                </span>
              </div>
            )}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--gx-cloud)' }}>
                {['모델명', 'S/N', '시작일', '출하예정', '진행률', '상태', '기구업체', '전장업체'].map(h => (
                  <th key={h} style={{
                    padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600,
                    color: 'var(--gx-steel)', letterSpacing: '0.5px', textTransform: 'uppercase' as const,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--gx-steel)', fontSize: '13px' }}>로딩 중...</td></tr>
              ) : !visibleItems.length ? (
                <tr><td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--gx-steel)', fontSize: '13px' }}>데이터 없음</td></tr>
              ) : (
                visibleItems.map(r => {
                  const tp = (r as any).task_progress as import('@/api/factory').TaskProgress | undefined;
                  const viewTotal = tp ? viewCategories.reduce((s: number, c: string) => s + (tp.by_category[c]?.total || 0), 0) : 0;
                  const viewCompleted = tp ? viewCategories.reduce((s: number, c: string) => s + (tp.by_category[c]?.completed || 0), 0) : 0;
                  const viewPct = viewTotal > 0 ? Math.round(viewCompleted / viewTotal * 1000) / 10 : r.progress_pct;
                  const pLevel = progressLevel(viewPct);
                  const sCfg = statusOf(viewPct);
                  const CAT_COLORS: Record<string, string> = { MECH: '#3B82F6', ELEC: '#F59E0B', TMS: '#8B5CF6', PI: '#EC4899', QI: '#10B981', SI: '#EF4444' };
                  return (
                    <tr key={r.serial_number} style={{ borderBottom: '1px solid var(--gx-cloud)' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>{r.model}</td>
                      <td style={{ padding: '14px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--gx-graphite)' }}>{r.serial_number}</td>
                      <td style={{ padding: '14px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--gx-graphite)' }}>{r.mech_start?.slice(5) || '—'}</td>
                      <td style={{ padding: '14px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--gx-graphite)' }}>{r.finishing_plan_end?.slice(5) || '—'}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: tp ? '6px' : 0 }}>
                          <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'var(--gx-mist)', minWidth: '80px', overflow: 'hidden' }}>
                            <div style={{ width: `${viewPct}%`, height: '100%', borderRadius: '3px', background: pLevel.bar }} />
                          </div>
                          <span style={{
                            fontSize: '12px', fontWeight: 600, color: pLevel.text,
                            fontFamily: "'JetBrains Mono', monospace", minWidth: '42px', textAlign: 'right' as const,
                          }}>{viewPct}%</span>
                        </div>
                        {tp && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {viewCategories.map(cat => {
                              const c = tp.by_category[cat];
                              if (!c) return null;
                              return (
                                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ fontSize: '9px', fontWeight: 600, color: CAT_COLORS[cat], minWidth: '28px' }}>{cat}</span>
                                  <div style={{ width: '36px', height: '3px', borderRadius: '2px', background: 'var(--gx-mist)', overflow: 'hidden' }}>
                                    <div style={{ width: `${c.pct}%`, height: '100%', borderRadius: '2px', background: CAT_COLORS[cat] }} />
                                  </div>
                                  <span style={{ fontSize: '9px', color: 'var(--gx-steel)', fontFamily: "'JetBrains Mono', monospace" }}>{c.completed}/{c.total}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                          background: sCfg.bg, color: sCfg.color,
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
                          {sCfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--gx-graphite)' }}>{r.mech_partner || '—'}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--gx-graphite)' }}>{r.elec_partner || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Grid: 파이프라인 + 월간 생산 지표 */}
        <div className="bottom-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* 최근 활동 피드 */}
          <div style={{
            background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
            boxShadow: 'var(--shadow-card)', overflow: 'hidden',
          }}>
            <div style={{ padding: '20px 24px 0' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>최근 활동</div>
              <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>ETL 변동이력 + 공정 진행 이벤트</div>
            </div>
            <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: '0' }}>
              {feedItems.length ? feedItems.slice(0, 8).map((evt, i) => {
                const timeStr = evt.time ? new Date(evt.time).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : '';
                return (
                  <div key={evt.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    padding: '10px 0',
                    borderBottom: i < 7 ? '1px solid var(--gx-cloud)' : 'none',
                  }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: evt.color.dot, marginTop: '5px', flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', color: 'var(--gx-charcoal)', lineHeight: 1.5 }}>
                        <span style={{ fontWeight: 600 }}>{evt.sn}</span>
                        <span style={{ color: 'var(--gx-steel)' }}> · </span>
                        <span style={{
                          display: 'inline-block', padding: '1px 6px', borderRadius: '4px',
                          fontSize: '10px', fontWeight: 600,
                          background: evt.color.bg, color: evt.color.dot,
                        }}>{evt.label}</span>
                        <span style={{ color: 'var(--gx-steel)' }}>
                          {evt.type === 'etl' ? ' 변경' : evt.type === 'defect' ? ' 발생' : ''}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px', fontFamily: "'JetBrains Mono', monospace" }}>
                        {evt.detail}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '10px', color: 'var(--gx-silver)', flexShrink: 0,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>{timeStr}</span>
                  </div>
                );
              }) : (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--gx-steel)', fontSize: '13px' }}>
                  최근 활동 없음
                </div>
              )}
            </div>
          </div>

          {/* 월간 생산 지표 */}
          <div style={{
            background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
            boxShadow: 'var(--shadow-card)', overflow: 'hidden',
          }}>
            <div style={{ padding: '20px 24px 0' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>월간 생산 지표</div>
              <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>
                {monthly ? `${monthly.month} 모델별 현황 (총 ${monthly.total}대)` : '—'}
              </div>
            </div>
            <div style={{ padding: '20px 24px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {monthlyModels.length > 0 ? monthlyModels.map(m => (
                  <div key={m.model} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: 500, color: 'var(--gx-slate)',
                      width: '120px', textAlign: 'right' as const, flexShrink: 0,
                    }}>{m.model}</span>
                    <div style={{
                      flex: 1, height: '24px', background: 'var(--gx-cloud)',
                      borderRadius: '6px', overflow: 'hidden', position: 'relative' as const,
                    }}>
                      <div style={{
                        height: '100%', width: `${m.pct}%`, borderRadius: '6px',
                        background: m.colorClass,
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                        paddingRight: '10px',
                        fontFamily: "'JetBrains Mono', monospace", fontSize: '11px',
                        fontWeight: 600, color: '#fff',
                        minWidth: 'fit-content',
                      }}>
                        {m.count}
                      </div>
                    </div>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
                      fontWeight: 600, color: 'var(--gx-graphite)',
                      minWidth: '40px',
                    }}>{m.count}대</span>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--gx-steel)', fontSize: '13px' }}>
                    {isLoading ? '로딩 중...' : '데이터 없음'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </Layout>
  );
}
