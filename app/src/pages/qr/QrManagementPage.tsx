// src/pages/qr/QrManagementPage.tsx
// QR 관리 페이지 — G-AXIS 디자인 시스템

import { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import Layout from '@/components/layout/Layout';
import { useQrList } from '@/hooks/useQr';
import { getQrList } from '@/api/qr';
import type { QrListParams, QrRecord } from '@/types/qr';

/* ── 아이콘 ── */
const QrIcon = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zm5-12a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V5zm2 2V6h1v1h-1z" clipRule="evenodd"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="7" cy="7" r="5"/><path d="M11 11l3.5 3.5"/>
  </svg>
);

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 12L6 8l4-4"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 4l4 4-4 4"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 2v8.5M4.5 7.5L8 11l3.5-3.5M3 13h10"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="3" width="12" height="11" rx="2"/>
    <path d="M2 7h12M5 1v4M11 1v4"/>
  </svg>
);

/* ── 날짜 포맷 ── */
function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  } catch {
    return '—';
  }
}

/* ── 상태 뱃지 ── */
function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'active';
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600,
      background: isActive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
      color: isActive ? '#16a34a' : '#dc2626',
    }}>
      {isActive ? 'Active' : 'Revoked'}
    </span>
  );
}

/* ── KPI 카드 ── */
function KpiCard({ label, value, color, sub }: { label: string; value: number; color: string; sub?: string }) {
  return (
    <div style={{
      background: 'var(--gx-white)',
      borderRadius: 'var(--radius-gx-lg)',
      padding: '20px 24px',
      boxShadow: 'var(--shadow-card)',
      transition: 'all 0.2s',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: 'var(--radius-gx-md)',
          background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '16px',
        }}>
          <QrIcon />
        </div>
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-steel)', letterSpacing: '0.3px' }}>{label}</span>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--gx-charcoal)', lineHeight: 1.1 }}>{value.toLocaleString()}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

/* ── 정렬 아이콘 ── */
function SortIndicator({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) {
  if (!active) return <span style={{ opacity: 0.3, fontSize: '10px', marginLeft: '4px' }}>⇅</span>;
  return <span style={{ fontSize: '10px', marginLeft: '4px', color: 'var(--gx-accent)' }}>{direction === 'asc' ? '↑' : '↓'}</span>;
}

/* ── CSV 생성 & 다운로드 ── */
function downloadCsv(items: { qr_doc_id: string; serial_number: string }[], filename: string) {
  const BOM = '\uFEFF';
  const header = 'QR_DOC_ID,SN';
  const rows = items.map(r => `${r.qr_doc_id},${r.serial_number}`);
  const csv = BOM + [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ===== 메인 컴포넌트 ===== */
export default function QrManagementPage() {
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('qr.created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const perPage = 30;

  // 날짜 필터
  const [dateField, setDateField] = useState<'mech_start' | 'module_start'>('mech_start');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // CSV 다운로드 로딩
  const [exporting, setExporting] = useState(false);

  const params: QrListParams = useMemo(() => ({
    search: search || undefined,
    model: modelFilter || undefined,
    status: statusFilter || undefined,
    page,
    per_page: perPage,
    sort_by: sortBy,
    sort_order: sortOrder,
    date_field: (dateFrom || dateTo) ? dateField : undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  }), [search, modelFilter, statusFilter, page, sortBy, sortOrder, dateField, dateFrom, dateTo]);

  const { data, isLoading, isError, dataUpdatedAt } = useQrList(params);

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleReset = () => {
    setSearch('');
    setSearchInput('');
    setModelFilter('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  // CSV 다운로드 — 현재 필터 기준 전체 데이터
  const handleExportCsv = useCallback(async () => {
    setExporting(true);
    try {
      const exportParams: QrListParams = {
        search: search || undefined,
        model: modelFilter || undefined,
        status: statusFilter || undefined,
        per_page: 10000,
        page: 1,
        sort_by: sortBy,
        sort_order: sortOrder,
        date_field: (dateFrom || dateTo) ? dateField : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      };
      const result = await getQrList(exportParams);
      if (result.items.length === 0) {
        alert('추출할 데이터가 없습니다.');
        return;
      }
      const dateLabel = dateField === 'mech_start' ? '기구시작' : '모듈시작';
      const range = dateFrom || dateTo ? `_${dateFrom || ''}~${dateTo || ''}` : '';
      const filename = `QR_${dateLabel}${range}.csv`;
      downloadCsv(result.items, filename);
    } catch {
      alert('CSV 추출 중 오류가 발생했습니다.');
    } finally {
      setExporting(false);
    }
  }, [search, modelFilter, statusFilter, sortBy, sortOrder, dateField, dateFrom, dateTo]);

  const hasDateFilter = dateFrom || dateTo;
  const hasAnyFilter = search || modelFilter || statusFilter || hasDateFilter;

  /* ── 테이블 컬럼 정의 ── */
  const columns: { key: string; label: string; sortable: boolean; width?: string }[] = [
    { key: 'qr_doc_id', label: 'QR Doc ID', sortable: false, width: '180px' },
    { key: 'serial_number', label: 'S/N', sortable: true, width: '140px' },
    { key: 'model', label: '모델', sortable: true, width: '130px' },
    { key: 'sales_order', label: 'Order No', sortable: true, width: '120px' },
    { key: 'customer', label: '고객사', sortable: false, width: '100px' },
    { key: 'mech_start', label: '기구시작', sortable: true, width: '110px' },
    { key: 'module_start', label: '모듈시작', sortable: true, width: '110px' },
    { key: 'ship_plan_date', label: '출하예정', sortable: false, width: '110px' },
    { key: 'status', label: '상태', sortable: false, width: '80px' },
  ];

  const items = data?.items ?? [];
  const stats = data?.stats ?? { total: 0, active: 0, revoked: 0 };
  const models = data?.models ?? [];
  const totalPages = data?.total_pages ?? 1;
  const total = data?.total ?? 0;

  /* ── 공통 input 스타일 ── */
  const selectStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 'var(--radius-gx-md)',
    border: '1px solid var(--gx-mist)', fontSize: '13px',
    color: 'var(--gx-charcoal)', background: 'var(--gx-cloud)',
    cursor: 'pointer', minWidth: '120px',
  };

  const dateInputStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 'var(--radius-gx-md)',
    border: '1px solid var(--gx-mist)', fontSize: '13px',
    color: 'var(--gx-charcoal)', background: 'var(--gx-white)',
    cursor: 'pointer', width: '140px',
  };

  return (
    <Layout title="QR 관리">
      <div style={{ padding: '28px 32px', maxWidth: '1400px' }}>
        {/* 동기화 상태 바 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            background: 'var(--gx-white)',
            borderRadius: 'var(--radius-gx-lg)',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: isError ? 'var(--gx-danger)' : 'var(--gx-success)',
                animation: isLoading ? 'pulse 1s infinite' : 'pulse 2s infinite',
                flexShrink: 0,
              }}
            />
            <div style={{ fontSize: '13px', color: 'var(--gx-slate)' }}>
              <strong style={{ color: 'var(--gx-charcoal)', fontWeight: 600 }}>
                {isLoading ? 'QR 데이터 동기화 중...' : isError ? 'QR 데이터 동기화 실패' : 'QR 데이터 동기화 완료'}
              </strong>
              {' · '}
              {total.toLocaleString()}건 등록
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 12px', borderRadius: 'var(--radius-gx-sm)',
                fontSize: '12px', fontWeight: 500,
                color: 'var(--gx-accent)', background: 'var(--gx-accent-soft)',
              }}
            >
              <QrIcon />
              QR Registry
            </div>
            {dataUpdatedAt > 0 && (
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
                  color: 'var(--gx-steel)', background: 'var(--gx-cloud)',
                  padding: '4px 12px', borderRadius: 'var(--radius-gx-sm)',
                }}
              >
                {format(new Date(dataUpdatedAt), 'yyyy-MM-dd HH:mm')} KST
              </div>
            )}
          </div>
        </div>

        {/* KPI 카드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <KpiCard label="전체 QR" value={stats.total} color="var(--gx-accent)" sub="등록된 전체 QR 코드" />
          <KpiCard label="Active" value={stats.active} color="#22c55e" sub="사용 가능" />
          <KpiCard label="Revoked" value={stats.revoked} color="#ef4444" sub="비활성화" />
        </div>

        {/* 필터 바 */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px',
          padding: '16px 20px', background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)',
        }}>
          {/* 1행: 모델/상태 필터 + 검색 */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* 모델 필터 */}
            <select
              value={modelFilter}
              onChange={e => { setModelFilter(e.target.value); setPage(1); }}
              style={{ ...selectStyle, minWidth: '140px' }}
            >
              <option value="">전체 모델</option>
              {models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            {/* 상태 필터 */}
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              style={selectStyle}
            >
              <option value="">전체 상태</option>
              <option value="active">Active</option>
              <option value="revoked">Revoked</option>
            </select>

            {/* 검색 */}
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="S/N 또는 QR Doc ID 검색..."
                style={{
                  width: '100%', padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-gx-md)', border: '1px solid var(--gx-mist)',
                  fontSize: '13px', color: 'var(--gx-charcoal)', background: 'var(--gx-cloud)',
                }}
              />
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gx-steel)' }}>
                <SearchIcon />
              </span>
            </div>

            <button
              onClick={handleSearch}
              style={{
                padding: '8px 18px', borderRadius: 'var(--radius-gx-md)',
                background: 'var(--gx-accent)', color: 'white', border: 'none',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              검색
            </button>
          </div>

          {/* 2행: 날짜 필터 + CSV 다운로드 */}
          <div style={{
            display: 'flex', gap: '12px', alignItems: 'center',
            paddingTop: '12px', borderTop: '1px solid var(--gx-mist)',
          }}>
            {/* 일정 기준 선택 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gx-steel)' }}>
              <CalendarIcon />
              <span style={{ fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap' }}>일정 기준</span>
            </div>
            <select
              value={dateField}
              onChange={e => { setDateField(e.target.value as 'mech_start' | 'module_start'); setPage(1); }}
              style={{ ...selectStyle, minWidth: '120px' }}
            >
              <option value="mech_start">기구시작</option>
              <option value="module_start">모듈시작</option>
            </select>

            {/* 날짜 범위 */}
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1); }}
              style={dateInputStyle}
            />
            <span style={{ fontSize: '13px', color: 'var(--gx-steel)' }}>~</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1); }}
              style={dateInputStyle}
            />

            <div style={{ flex: 1 }} />

            {/* 초기화 */}
            {hasAnyFilter && (
              <button
                onClick={handleReset}
                style={{
                  padding: '8px 14px', borderRadius: 'var(--radius-gx-md)',
                  background: 'var(--gx-cloud)', color: 'var(--gx-steel)', border: '1px solid var(--gx-mist)',
                  fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                초기화
              </button>
            )}

            {/* CSV 다운로드 */}
            <button
              onClick={handleExportCsv}
              disabled={exporting}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: 'var(--radius-gx-md)',
                background: exporting ? 'var(--gx-cloud)' : 'var(--gx-charcoal)',
                color: exporting ? 'var(--gx-steel)' : 'white',
                border: 'none', fontSize: '13px', fontWeight: 600,
                cursor: exporting ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
              }}
            >
              <DownloadIcon />
              {exporting ? '추출 중...' : 'CSV 다운로드'}
            </button>
          </div>
        </div>

        {/* 결과 카운트 */}
        <div style={{ fontSize: '12px', color: 'var(--gx-steel)', marginBottom: '12px', paddingLeft: '4px' }}>
          총 <strong style={{ color: 'var(--gx-charcoal)' }}>{total.toLocaleString()}</strong>건
          {search && <span> · "{search}" 검색결과</span>}
          {hasDateFilter && (
            <span> · {dateField === 'mech_start' ? '기구시작' : '모듈시작'} {dateFrom || '…'} ~ {dateTo || '…'}</span>
          )}
        </div>

        {/* 테이블 */}
        <div style={{
          background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)', overflow: 'hidden',
        }}>
          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--gx-steel)' }}>
              <div style={{ fontSize: '14px' }}>데이터를 불러오는 중...</div>
            </div>
          ) : isError ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--gx-danger)' }}>
              <div style={{ fontSize: '14px' }}>데이터 조회 실패. 다시 시도해주세요.</div>
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--gx-steel)' }}>
              <div style={{ fontSize: '14px' }}>조회된 QR이 없습니다.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--gx-cloud)', borderBottom: '1px solid var(--gx-mist)' }}>
                    {columns.map(col => (
                      <th
                        key={col.key}
                        onClick={() => col.sortable && handleSort(col.key)}
                        style={{
                          padding: '12px 14px', textAlign: 'left',
                          fontSize: '11px', fontWeight: 600, letterSpacing: '0.3px',
                          color: 'var(--gx-steel)', whiteSpace: 'nowrap',
                          cursor: col.sortable ? 'pointer' : 'default',
                          width: col.width,
                          userSelect: 'none',
                        }}
                      >
                        {col.label}
                        {col.sortable && <SortIndicator active={sortBy === col.key} direction={sortOrder} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: QrRecord, idx: number) => (
                    <tr
                      key={item.qr_id}
                      style={{
                        borderBottom: '1px solid var(--gx-mist)',
                        background: idx % 2 === 1 ? 'rgba(248,250,252,0.5)' : 'transparent',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 1 ? 'rgba(248,250,252,0.5)' : 'transparent'; }}
                    >
                      <td style={{ padding: '11px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--gx-accent)', fontWeight: 500 }}>
                        {item.qr_doc_id}
                      </td>
                      <td style={{ padding: '11px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
                        {item.serial_number}
                      </td>
                      <td style={{ padding: '11px 14px', color: 'var(--gx-charcoal)' }}>{item.model || '—'}</td>
                      <td style={{ padding: '11px 14px', color: 'var(--gx-slate)' }}>{item.sales_order || '—'}</td>
                      <td style={{ padding: '11px 14px', color: 'var(--gx-slate)' }}>{item.customer || '—'}</td>
                      <td style={{ padding: '11px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--gx-slate)' }}>
                        {formatDate(item.mech_start)}
                      </td>
                      <td style={{ padding: '11px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--gx-slate)' }}>
                        {formatDate(item.module_start)}
                      </td>
                      <td style={{ padding: '11px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--gx-slate)' }}>
                        {formatDate(item.ship_plan_date)}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '16px', borderTop: '1px solid var(--gx-mist)',
            }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{
                  padding: '6px 10px', borderRadius: 'var(--radius-gx-sm)',
                  border: '1px solid var(--gx-mist)', background: 'var(--gx-white)',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: page <= 1 ? 0.4 : 1, display: 'flex', alignItems: 'center',
                }}
              >
                <ChevronLeft />
              </button>
              <span style={{ fontSize: '12px', color: 'var(--gx-steel)', padding: '0 8px' }}>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{
                  padding: '6px 10px', borderRadius: 'var(--radius-gx-sm)',
                  border: '1px solid var(--gx-mist)', background: 'var(--gx-white)',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center',
                }}
              >
                <ChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
