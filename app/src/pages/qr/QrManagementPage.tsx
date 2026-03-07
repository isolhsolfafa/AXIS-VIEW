// src/pages/qr/QrManagementPage.tsx
// QR 관리 페이지 — G-AXIS 디자인 시스템

import { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { useQrList } from '@/hooks/useQr';
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

  const params: QrListParams = useMemo(() => ({
    search: search || undefined,
    model: modelFilter || undefined,
    status: statusFilter || undefined,
    page,
    per_page: perPage,
    sort_by: sortBy,
    sort_order: sortOrder,
  }), [search, modelFilter, statusFilter, page, sortBy, sortOrder]);

  const { data, isLoading, isError } = useQrList(params);

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

  /* ── 테이블 컬럼 정의 ── */
  const columns: { key: string; label: string; sortable: boolean; width?: string }[] = [
    { key: 'qr_doc_id', label: 'QR Doc ID', sortable: false, width: '180px' },
    { key: 'serial_number', label: 'S/N', sortable: true, width: '140px' },
    { key: 'model', label: '모델', sortable: true, width: '130px' },
    { key: 'sales_order', label: 'Order No', sortable: true, width: '120px' },
    { key: 'customer', label: '고객사', sortable: false, width: '100px' },
    { key: 'mech_start', label: '기구시작', sortable: true, width: '110px' },
    { key: 'module_start', label: '반제품시작', sortable: true, width: '110px' },
    { key: 'ship_plan_date', label: '출하예정', sortable: false, width: '110px' },
    { key: 'status', label: '상태', sortable: false, width: '80px' },
  ];

  const items = data?.items ?? [];
  const stats = data?.stats ?? { total: 0, active: 0, revoked: 0 };
  const models = data?.models ?? [];
  const totalPages = data?.total_pages ?? 1;
  const total = data?.total ?? 0;

  return (
    <Layout>
      <div style={{ padding: '28px 32px', maxWidth: '1400px' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--gx-charcoal)', margin: 0, letterSpacing: '-0.3px' }}>
            QR 관리
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--gx-steel)', marginTop: '6px' }}>
            QR Registry 및 제품 메타데이터 조회
          </p>
        </div>

        {/* KPI 카드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <KpiCard label="전체 QR" value={stats.total} color="var(--gx-accent)" sub="등록된 전체 QR 코드" />
          <KpiCard label="Active" value={stats.active} color="#22c55e" sub="사용 가능" />
          <KpiCard label="Revoked" value={stats.revoked} color="#ef4444" sub="비활성화" />
        </div>

        {/* 필터 바 */}
        <div style={{
          display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px',
          padding: '16px 20px', background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)',
        }}>
          {/* 모델 필터 */}
          <select
            value={modelFilter}
            onChange={e => { setModelFilter(e.target.value); setPage(1); }}
            style={{
              padding: '8px 12px', borderRadius: 'var(--radius-gx-md)',
              border: '1px solid var(--gx-mist)', fontSize: '13px',
              color: 'var(--gx-charcoal)', background: 'var(--gx-cloud)',
              cursor: 'pointer', minWidth: '140px',
            }}
          >
            <option value="">전체 모델</option>
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          {/* 상태 필터 */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{
              padding: '8px 12px', borderRadius: 'var(--radius-gx-md)',
              border: '1px solid var(--gx-mist)', fontSize: '13px',
              color: 'var(--gx-charcoal)', background: 'var(--gx-cloud)',
              cursor: 'pointer', minWidth: '120px',
            }}
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

          {(search || modelFilter || statusFilter) && (
            <button
              onClick={() => { setSearch(''); setSearchInput(''); setModelFilter(''); setStatusFilter(''); setPage(1); }}
              style={{
                padding: '8px 14px', borderRadius: 'var(--radius-gx-md)',
                background: 'var(--gx-cloud)', color: 'var(--gx-steel)', border: '1px solid var(--gx-mist)',
                fontSize: '12px', cursor: 'pointer',
              }}
            >
              초기화
            </button>
          )}
        </div>

        {/* 결과 카운트 */}
        <div style={{ fontSize: '12px', color: 'var(--gx-steel)', marginBottom: '12px', paddingLeft: '4px' }}>
          총 <strong style={{ color: 'var(--gx-charcoal)' }}>{total.toLocaleString()}</strong>건
          {search && <span> · "{search}" 검색결과</span>}
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
