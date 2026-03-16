// src/pages/plan/ProductionPlanPage.tsx
// 생산일정 — 통합 필터 + 공정 중복 + sorting

import { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { useMonthlyDetail } from '@/hooks/useFactory';
import type { ProductionItem, CompletionStatus } from '@/api/factory';

/* ── 날짜 컬럼 키 ─── */
type DateType = 'mech_start' | 'mech_end' | 'elec_start' | 'elec_end' | 'pi_start' | 'qi_start' | 'si_start' | 'ship_plan_date';
const DATE_KEYS: DateType[] = ['mech_start', 'mech_end', 'elec_start', 'elec_end', 'pi_start', 'qi_start', 'si_start', 'ship_plan_date'];

const TABLE_COLS: { label: string; key?: DateType }[] = [
  { label: 'O/N' }, { label: '제품번호' }, { label: 'S/N' }, { label: '모델' },
  { label: '고객사' }, { label: '라인' }, { label: '기구업체' }, { label: '전장업체' },
  { label: '기구시작', key: 'mech_start' }, { label: '기구종료', key: 'mech_end' },
  { label: '전장시작', key: 'elec_start' }, { label: '전장종료', key: 'elec_end' },
  { label: '가압시작', key: 'pi_start' }, { label: '공정시작', key: 'qi_start' },
  { label: '마무리', key: 'si_start' }, { label: '출하계획', key: 'ship_plan_date' },
];

/* ── 완료 체크마크 매핑 (BE complete 값 준비 후 활성화) ─── */
// TODO: BE에서 completion 실데이터 내려오면 ENABLE_CHECKMARKS = true 전환
const ENABLE_CHECKMARKS = false;
const COMPLETION_MAP: Partial<Record<DateType, keyof CompletionStatus>> = {
  mech_end: 'mech',
  elec_end: 'elec',
  pi_start: 'pi',
  qi_start: 'qi',
  si_start: 'si',
};

/* ── 공정 필터 정의 ─── */
const STAGE_FILTERS = [
  { key: 'pi', label: '가압', dateKey: 'pi_start' as DateType, color: '#EC4899', bg: 'rgba(236,72,153,0.08)' },
  { key: 'qi', label: '공정', dateKey: 'qi_start' as DateType, color: '#6366F1', bg: 'rgba(99,102,241,0.08)' },
  { key: 'si', label: '마무리', dateKey: 'si_start' as DateType, color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
  { key: 'shipped', label: '출하', dateKey: 'ship_plan_date' as DateType, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
];

/* ── 공정 중복 색상 ─── */
const DUP_BG: Record<number, string> = {
  2: 'rgba(59,130,246,0.10)',
  3: 'rgba(236,72,153,0.10)',
  4: 'rgba(245,158,11,0.13)',
};

/* ── 날짜 유틸 ─── */
function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekRange(): [string, string] {
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return [fmt(mon), fmt(sun)];
}

function isInPeriod(dateStr: string | null, filter: 'today' | 'week' | 'all'): boolean {
  if (!dateStr) return false;
  if (filter === 'all') return true;
  const d = dateStr.slice(0, 10);
  if (filter === 'today') return d === todayStr();
  const [start, end] = getWeekRange();
  return d >= start && d <= end;
}

/* ── 행별 중복 날짜 카운트 ─── */
function getRowDupMap(row: ProductionItem): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const key of DATE_KEYS) {
    const val = row[key] as string | null;
    if (val) {
      const dateOnly = val.slice(0, 10);
      counts[dateOnly] = (counts[dateOnly] || 0) + 1;
    }
  }
  return counts;
}

/* ── 날짜 셀 ─── */
function DateCell({ value, completed, dupCount }: { value: string | null; completed?: boolean; dupCount?: number }) {
  if (!value) return <td style={{ padding: '11px 14px', color: 'var(--gx-silver)' }}>—</td>;

  const display = value.slice(5); // MM-DD
  const d = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const isToday = d.getTime() === today.getTime();
  const isPast = d < today;

  const dupBg = dupCount && dupCount >= 2 ? (DUP_BG[Math.min(dupCount, 4)] || DUP_BG[4]) : undefined;

  if (isToday) {
    return (
      <td style={{ padding: '11px 14px', background: dupBg }}>
        <span style={{
          background: 'var(--gx-warning)', color: '#fff', fontWeight: 700,
          padding: '3px 8px', borderRadius: '4px', display: 'inline-block',
          fontFamily: "'JetBrains Mono', monospace", fontSize: '11.5px',
        }}>{display}</span>
        {completed && <span style={{ marginLeft: '3px', color: 'var(--gx-success)', fontSize: '11px' }}>✓</span>}
      </td>
    );
  }

  return (
    <td style={{
      padding: '11px 14px',
      fontFamily: "'JetBrains Mono', monospace", fontSize: '11.5px',
      whiteSpace: 'nowrap',
      background: dupBg,
    }}>
      <span style={{ color: isPast ? 'var(--gx-danger)' : 'var(--gx-success)' }}>
        {display}
      </span>
      {completed && <span style={{ marginLeft: '3px', color: 'var(--gx-success)', fontSize: '11px' }}>✓</span>}
    </td>
  );
}

/* ── 범례 칩 ─── */
function LegendChip({ label, bg, color, border }: { label: string; bg: string; color: string; border?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 500,
      background: bg, color, border: border || 'none',
    }}>{label}</span>
  );
}

/* ── 월 옵션 ─── */
function getMonthOptions(): { value: string; label: string }[] {
  const opts: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = -2; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    opts.push({ value: val, label: `${d.getFullYear()}년 ${d.getMonth() + 1}월` });
  }
  return opts;
}

/* ── 메인 컴포넌트 ─── */
export default function ProductionPlanPage() {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [dateField, setDateField] = useState<'pi_start' | 'mech_start'>('pi_start');
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<'today' | 'week' | 'all'>('today');
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState<DateType | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const { data, isLoading, dataUpdatedAt, isFetching, refetch } = useMonthlyDetail({ month, date_field: dateField, per_page: 500 });
  const monthOptions = useMemo(() => getMonthOptions(), []);

  /* ── 필터 + 정렬 + 공정 카운트 ── */
  const { items, stageCounts, totalFiltered } = useMemo(() => {
    if (!data?.items) return { items: [], stageCounts: {} as Record<string, number>, totalFiltered: 0 };

    // 1. 검색 필터
    let filtered = data.items;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((i: ProductionItem) =>
        i.serial_number.toLowerCase().includes(q) ||
        i.sales_order.toLowerCase().includes(q) ||
        i.model.toLowerCase().includes(q)
      );
    }

    // 2. 공정별 카운트 (quick filter 기간 내)
    const counts: Record<string, number> = {};
    for (const sf of STAGE_FILTERS) {
      counts[sf.key] = filtered.filter((i: ProductionItem) => isInPeriod(i[sf.dateKey] as string | null, quickFilter)).length;
    }

    // 3. 공정 필터 적용
    if (stageFilter) {
      const sf = STAGE_FILTERS.find(s => s.key === stageFilter);
      if (sf) {
        filtered = filtered.filter((i: ProductionItem) => isInPeriod(i[sf.dateKey] as string | null, quickFilter));
      }
    }

    // 4. 정렬
    if (sortCol) {
      filtered = [...filtered].sort((a, b) => {
        const va = (a[sortCol] as string | null) || '';
        const vb = (b[sortCol] as string | null) || '';
        if (!va && !vb) return 0;
        if (!va) return 1;
        if (!vb) return -1;
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }

    return { items: filtered, stageCounts: counts, totalFiltered: filtered.length };
  }, [data, search, quickFilter, stageFilter, sortCol, sortDir]);

  /* ── 페이지네이션 ── */
  const PAGE_SIZE = 50;
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── 핸들러 ── */
  const handleSort = (key: DateType) => {
    if (sortCol === key) {
      if (sortDir === 'desc') { setSortCol(null); setSortDir('asc'); }
      else setSortDir('desc');
    } else {
      setSortCol(key);
      setSortDir('asc');
    }
  };

  const handleQuickFilter = (f: 'today' | 'week' | 'all') => {
    setQuickFilter(f);
    setStageFilter(null);
    setPage(1);
  };

  const handleStageFilter = (key: string) => {
    setStageFilter(prev => prev === key ? null : key);
    setPage(1);
  };

  return (
    <Layout title="생산일정">
      <div style={{ padding: '28px 32px', maxWidth: '1600px' }}>

        {/* Legend Strip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
          padding: '14px 20px', background: 'var(--gx-white)',
          borderRadius: 'var(--radius-gx-lg)', boxShadow: 'var(--shadow-card)',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            <span style={{ fontWeight: 600, color: 'var(--gx-graphite)', marginRight: '4px' }}>날짜 색상:</span>
            <LegendChip label="● 지난 날짜" bg="rgba(239,68,68,0.08)" color="var(--gx-danger)" />
            <LegendChip label="★ 오늘" bg="rgba(245,158,11,0.08)" color="var(--gx-warning)" border="1px solid var(--gx-warning)" />
            <LegendChip label="● 예정 날짜" bg="rgba(16,185,129,0.08)" color="var(--gx-success)" />
          </div>
          <div style={{ width: '1px', height: '20px', background: 'var(--gx-mist)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            <span style={{ fontWeight: 600, color: 'var(--gx-graphite)', marginRight: '4px' }}>공정 중복:</span>
            <LegendChip label="2개" bg="rgba(59,130,246,0.10)" color="#3B82F6" />
            <LegendChip label="3개" bg="rgba(236,72,153,0.10)" color="#EC4899" />
            <LegendChip label="4개" bg="rgba(245,158,11,0.13)" color="#F59E0B" />
          </div>
        </div>

        {/* 통합 필터바 */}
        <div style={{
          background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)', marginBottom: '16px', overflow: 'hidden',
        }}>
          {/* 상단: Quick filters + 기준 + 월 + 검색 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
            padding: '14px 20px',
          }}>
            {/* Quick filters */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {([
                { value: 'today' as const, label: '오늘' },
                { value: 'week' as const, label: '이번주' },
                { value: 'all' as const, label: '전체' },
              ]).map(f => (
                <button
                  key={f.value}
                  onClick={() => handleQuickFilter(f.value)}
                  style={{
                    padding: '7px 16px', borderRadius: '10px',
                    fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                    transition: 'all 0.15s', border: '1px solid',
                    ...(quickFilter === f.value
                      ? { background: 'var(--gx-accent)', color: '#fff', borderColor: 'var(--gx-accent)' }
                      : { background: 'transparent', color: 'var(--gx-slate)', borderColor: 'var(--gx-mist)' }),
                  }}
                >{f.label}</button>
              ))}
            </div>

            <div style={{ width: '1px', height: '28px', background: 'var(--gx-mist)' }} />

            {/* 기준 */}
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-steel)' }}>기준:</span>
            <select
              value={dateField}
              onChange={(e) => { setDateField(e.target.value as 'pi_start' | 'mech_start'); setPage(1); setStageFilter(null); }}
              style={{
                padding: '7px 12px', borderRadius: '10px',
                border: '1px solid var(--gx-mist)', background: 'var(--gx-white)',
                fontSize: '12px', color: 'var(--gx-graphite)', cursor: 'pointer',
              }}
            >
              <option value="mech_start">기구시작</option>
              <option value="pi_start">가압시작</option>
            </select>

            {/* 월 */}
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-steel)' }}>월:</span>
            <select
              value={month}
              onChange={(e) => { setMonth(e.target.value); setPage(1); setStageFilter(null); }}
              style={{
                padding: '7px 12px', borderRadius: '10px',
                border: '1px solid var(--gx-mist)', background: 'var(--gx-white)',
                fontSize: '12px', color: 'var(--gx-graphite)', cursor: 'pointer',
              }}
            >
              {monthOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <div style={{ width: '1px', height: '28px', background: 'var(--gx-mist)' }} />

            {/* 검색 */}
            <input
              type="text"
              placeholder="오더번호, 모델, S/N 검색..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{
                padding: '7px 12px', borderRadius: '10px',
                border: '1px solid var(--gx-mist)', background: 'var(--gx-snow)',
                fontSize: '12px', color: 'var(--gx-graphite)', minWidth: '200px',
              }}
            />

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                fontSize: '11px', color: 'var(--gx-steel)',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {totalFiltered}건 {data ? `/ ${data.total}건` : ''}
              </span>
              <div style={{ width: '1px', height: '16px', background: 'var(--gx-mist)' }} />
              <span style={{
                fontSize: '10px', color: 'var(--gx-silver)',
                fontFamily: "'JetBrains Mono', monospace",
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
          </div>

          {/* 하단: 공정 파이프라인 (circle 스타일 + 클릭 필터) */}
          <div style={{
            display: 'grid', gridTemplateColumns: `repeat(${STAGE_FILTERS.length}, 1fr)`,
            padding: '20px 24px 24px', position: 'relative',
            borderTop: '1px solid var(--gx-cloud)',
          }}>
            {/* 연결선 */}
            <div style={{
              position: 'absolute', top: '50%', left: '60px', right: '60px',
              height: '2px', background: 'var(--gx-mist)', transform: 'translateY(-4px)',
            }} />
            {STAGE_FILTERS.map(sf => {
              const count = stageCounts[sf.key] ?? 0;
              const active = stageFilter === sf.key;
              return (
                <button
                  key={sf.key}
                  onClick={() => handleStageFilter(sf.key)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '10px', position: 'relative', zIndex: 1,
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                    color: '#fff', background: sf.color,
                    boxShadow: active
                      ? `0 4px 14px ${sf.color}66, 0 0 0 3px ${sf.bg}`
                      : `0 4px 14px ${sf.color}4D`,
                    transition: 'all 0.2s',
                    transform: active ? 'scale(1.1)' : 'scale(1)',
                  }}>{count}</div>
                  <div style={{
                    fontSize: '12px', fontWeight: 600, textAlign: 'center',
                    color: active ? sf.color : 'var(--gx-slate)',
                    transition: 'color 0.15s',
                  }}>{sf.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)', overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
              <thead>
                <tr style={{ background: 'var(--gx-cloud)' }}>
                  {TABLE_COLS.map(col => (
                    <th
                      key={col.label}
                      onClick={col.key ? () => handleSort(col.key!) : undefined}
                      style={{
                        padding: '11px 14px', textAlign: 'left',
                        fontSize: '10.5px', fontWeight: 600, color: 'var(--gx-steel)',
                        letterSpacing: '0.5px', textTransform: 'uppercase' as const,
                        whiteSpace: 'nowrap', borderBottom: '2px solid var(--gx-mist)',
                        cursor: col.key ? 'pointer' : 'default',
                        userSelect: 'none',
                        background: sortCol === col.key ? 'rgba(99,102,241,0.06)' : undefined,
                      }}
                    >
                      {col.label}
                      {col.key && sortCol === col.key && (
                        <span style={{ marginLeft: '4px', color: 'var(--gx-accent)', fontSize: '10px' }}>
                          {sortDir === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                      {col.key && sortCol !== col.key && (
                        <span style={{ marginLeft: '4px', color: 'var(--gx-silver)', fontSize: '9px' }}>⇅</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={TABLE_COLS.length} style={{ padding: '40px 14px', textAlign: 'center', color: 'var(--gx-steel)', fontSize: '13px' }}>로딩 중...</td></tr>
                ) : pageItems.length === 0 ? (
                  <tr><td colSpan={TABLE_COLS.length} style={{ padding: '40px 14px', textAlign: 'center', color: 'var(--gx-steel)', fontSize: '13px' }}>
                    {stageFilter ? '해당 공정에 데이터 없음' : '데이터 없음'}
                  </td></tr>
                ) : (
                  pageItems.map((row: ProductionItem, i: number) => {
                    const dupMap = getRowDupMap(row);
                    return (
                      <tr key={`${row.serial_number}-${i}`} style={{ borderBottom: '1px solid var(--gx-cloud)' }}>
                        <td style={{ padding: '11px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11.5px', color: 'var(--gx-graphite)' }}>{row.sales_order}</td>
                        <td style={{ padding: '11px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11.5px', color: 'var(--gx-graphite)' }}>{row.product_code}</td>
                        <td style={{ padding: '11px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11.5px', color: 'var(--gx-graphite)' }}>{row.serial_number}</td>
                        <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--gx-charcoal)', whiteSpace: 'nowrap' }}>{row.model}</td>
                        <td style={{ padding: '11px 14px', color: 'var(--gx-graphite)', fontSize: '12.5px' }}>{row.customer}</td>
                        <td style={{ padding: '11px 14px', color: 'var(--gx-graphite)', fontSize: '12.5px' }}>{row.line}</td>
                        <td style={{ padding: '11px 14px', color: 'var(--gx-graphite)', fontSize: '12.5px' }}>{row.mech_partner}</td>
                        <td style={{ padding: '11px 14px', color: 'var(--gx-graphite)', fontSize: '12.5px' }}>{row.elec_partner}</td>
                        {DATE_KEYS.map(k => {
                          const val = row[k] as string | null;
                          const compKey = ENABLE_CHECKMARKS ? COMPLETION_MAP[k] : undefined;
                          const completed = compKey ? row.completion[compKey] === true : false;
                          const dupCount = val ? (dupMap[val.slice(0, 10)] || 0) : 0;
                          return (
                            <DateCell key={k} value={val} completed={completed} dupCount={dupCount} />
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '16px 24px', borderTop: '1px solid var(--gx-cloud)',
            }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
                  border: '1px solid var(--gx-mist)', background: 'var(--gx-white)',
                  color: page <= 1 ? 'var(--gx-silver)' : 'var(--gx-graphite)',
                  cursor: page <= 1 ? 'default' : 'pointer',
                }}
              >이전</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    style={{
                      padding: '6px 12px', borderRadius: '8px', fontSize: '12px',
                      fontWeight: page === pageNum ? 600 : 400,
                      border: '1px solid',
                      borderColor: page === pageNum ? 'var(--gx-accent)' : 'var(--gx-mist)',
                      background: page === pageNum ? 'var(--gx-accent)' : 'var(--gx-white)',
                      color: page === pageNum ? '#fff' : 'var(--gx-graphite)',
                      cursor: 'pointer',
                    }}
                  >{pageNum}</button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
                  border: '1px solid var(--gx-mist)', background: 'var(--gx-white)',
                  color: page >= totalPages ? 'var(--gx-silver)' : 'var(--gx-graphite)',
                  cursor: page >= totalPages ? 'default' : 'pointer',
                }}
              >다음</button>
              <span style={{ fontSize: '11px', color: 'var(--gx-steel)', marginLeft: '8px' }}>
                {items.length}건 중 {(page - 1) * PAGE_SIZE + 1}~{Math.min(page * PAGE_SIZE, items.length)}
              </span>
            </div>
          )}
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </Layout>
  );
}
