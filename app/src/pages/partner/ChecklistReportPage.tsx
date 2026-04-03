// src/pages/partner/ChecklistReportPage.tsx
// 체크리스트 성적서 — Sprint 28

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchSNList, getChecklistReport } from '@/api/checklist';
import ChecklistReportView from '@/components/partner/ChecklistReportView';

/** 현재 월 YYYY-MM */
function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** 월 이동 */
function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** YYYY-MM → 표시 라벨 */
function formatMonthLabel(month: string): string {
  const [y, m] = month.split('-');
  return `${y}년 ${Number(m)}월`;
}

export default function ChecklistReportPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');     // 검색 시 월 뷰 대체
  const [selectedSN, setSelectedSN] = useState<string | null>(null);

  // ── 월별 S/N 목록 (기본뷰) ──
  const { data: monthData, isLoading: monthLoading } = useQuery({
    queryKey: ['reportSNList', 'month', selectedMonth],
    queryFn: () => searchSNList({ month: selectedMonth }),
    enabled: !searchQuery,
  });

  // ── 검색 결과 (검색 시) ──
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['reportSNList', 'search', searchQuery],
    queryFn: () => searchSNList({ query: searchQuery }),
    enabled: !!searchQuery,
  });

  // ── S/N 선택 → 성적서 ──
  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ['checklistReport', selectedSN],
    queryFn: () => getChecklistReport(selectedSN!),
    enabled: !!selectedSN,
  });

  const listData = searchQuery ? searchData : monthData;
  const listLoading = searchQuery ? searchLoading : monthLoading;

  function handleSearch() {
    const q = searchInput.trim();
    if (!q) {
      // 빈 검색 → 월별 뷰 복귀
      setSearchQuery('');
      return;
    }
    setSearchQuery(q);
    setSelectedSN(null);
  }

  function clearSearch() {
    setSearchInput('');
    setSearchQuery('');
    setSelectedSN(null);
  }

  return (
    <div style={{ display: 'flex', gap: '20px', height: '100%', padding: '24px' }}>
      {/* ── 좌측: 월 선택 + 검색 + S/N 목록 ── */}
      <div style={{
        width: '340px', flexShrink: 0,
        display: 'flex', flexDirection: 'column', gap: '12px',
      }}>
        {/* 월 네비게이션 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-md, 10px)',
          padding: '10px 12px', border: '1px solid var(--gx-mist)',
        }}>
          <button
            onClick={() => { setSelectedMonth(m => shiftMonth(m, -1)); clearSearch(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gx-slate)', padding: '4px' }}
          >
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gx-charcoal)' }}>
            {formatMonthLabel(selectedMonth)}
          </span>
          <button
            onClick={() => { setSelectedMonth(m => shiftMonth(m, 1)); clearSearch(); }}
            disabled={selectedMonth >= getCurrentMonth()}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
              color: selectedMonth >= getCurrentMonth() ? 'var(--gx-silver)' : 'var(--gx-slate)',
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* 검색바 */}
        <div style={{
          display: 'flex', gap: '8px',
          background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-md, 10px)',
          padding: '10px 14px', border: '1px solid var(--gx-mist)',
        }}>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="O/N 또는 S/N 검색"
            style={{
              flex: 1, border: 'none', outline: 'none', fontSize: '14px',
              background: 'transparent', color: 'var(--gx-charcoal)',
            }}
          />
          {searchQuery && (
            <button onClick={clearSearch} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--gx-steel)', fontSize: '13px', padding: '4px 6px',
            }}>
              초기화
            </button>
          )}
          <button onClick={handleSearch} style={{
            background: 'var(--gx-accent)', border: 'none', borderRadius: '6px',
            padding: '6px 14px', cursor: 'pointer', color: '#fff',
            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px',
          }}>
            <Search size={14} /> 검색
          </button>
        </div>

        {/* S/N 목록 */}
        <div style={{
          flex: 1, overflow: 'auto',
          background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-md, 10px)',
          border: '1px solid var(--gx-mist)', padding: '8px',
        }}>
          {listLoading && (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--gx-steel)' }}>
              {searchQuery ? '검색 중...' : '로딩 중...'}
            </div>
          )}
          {!listLoading && listData && listData.products.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: '13px', color: 'var(--gx-silver)' }}>
              <FileText size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
              <div>{searchQuery ? '검색 결과가 없습니다' : `${formatMonthLabel(selectedMonth)} 데이터가 없습니다`}</div>
            </div>
          )}
          {listData?.products.map((p) => (
            <div
              key={p.serial_number}
              onClick={() => setSelectedSN(p.serial_number)}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                border: selectedSN === p.serial_number ? '2px solid var(--gx-accent)' : '1px solid transparent',
                background: selectedSN === p.serial_number ? 'rgba(99,102,241,0.04)' : 'transparent',
                marginBottom: '4px',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)', fontFamily: "'JetBrains Mono', monospace" }}>
                {p.serial_number}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--gx-steel)' }}>{p.model}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: p.overall_percent === 100 ? 'var(--gx-success)' : 'var(--gx-slate)' }}>
                  {p.overall_percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 우측: 성적서 뷰 ── */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {!selectedSN && (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-md, 10px)',
            border: '1px solid var(--gx-mist)', color: 'var(--gx-silver)', fontSize: '14px',
          }}>
            좌측에서 S/N을 선택하면 체크리스트 성적서가 표시됩니다
          </div>
        )}
        {reportLoading && (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-md, 10px)',
            border: '1px solid var(--gx-mist)', color: 'var(--gx-steel)', fontSize: '14px',
          }}>
            성적서 로딩 중...
          </div>
        )}
        {reportData && <ChecklistReportView data={reportData} />}
      </div>
    </div>
  );
}
