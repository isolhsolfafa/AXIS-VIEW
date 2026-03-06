// src/components/attendance/AttendanceTable.tsx
// 출퇴근 현황 테이블 — 컨셉 HTML 완전 적용

import { useState } from 'react';
import type { AttendanceRecord } from '@/types/attendance';
import { format, parseISO } from 'date-fns';

type SortKey = 'worker_name' | 'company' | 'role' | 'check_in_time' | 'check_out_time' | 'status';
type SortDir = 'asc' | 'desc';

interface AttendanceTableProps {
  records: AttendanceRecord[];
}

const COMPANY_COLORS: Record<string, string> = {
  'C&A': '#6366F1',
  'FNI': '#3B82F6',
  'BAT': '#EF4444',
  'TMS(E)': '#F59E0B',
  'TMS(M)': '#8B5CF6',
  'NONE': '#64748B',
  'P&S': '#10B981',
};

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'HH:mm');
  } catch {
    return '—';
  }
}

function ProgressBar({ rate }: { rate: number }) {
  const colorClass = rate >= 80 ? 'var(--gx-success)' : rate >= 50 ? 'var(--gx-warning)' : 'var(--gx-danger)';
  const textColor = rate >= 80 ? 'var(--gx-success)' : rate >= 50 ? 'var(--gx-warning)' : 'var(--gx-danger)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div
        style={{
          flex: 1,
          height: '6px',
          background: 'var(--gx-mist)',
          borderRadius: '3px',
          overflow: 'hidden',
          minWidth: '80px',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${rate}%`,
            background: colorClass,
            borderRadius: '3px',
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '12px',
          fontWeight: 600,
          color: textColor,
          minWidth: '42px',
          textAlign: 'right',
        }}
      >
        {rate}%
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: AttendanceRecord['status'] }) {
  if (status === 'working') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 600,
          background: 'var(--gx-success-bg)',
          color: 'var(--gx-success)',
        }}
      >
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
        근무중
      </span>
    );
  }
  if (status === 'left') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 600,
          background: 'var(--gx-cloud)',
          color: 'var(--gx-steel)',
        }}
      >
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
        퇴근
      </span>
    );
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 600,
        background: 'var(--gx-warning-bg)',
        color: 'var(--gx-warning)',
      }}
    >
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      미체크
    </span>
  );
}

const SortUpIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
    <path d="M5 2l3.5 5h-7L5 2z"/>
  </svg>
);

const SortDownIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
    <path d="M5 8L1.5 3h7L5 8z"/>
  </svg>
);

export default function AttendanceTable({ records }: AttendanceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('company');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = [...records].sort((a, b) => {
    let av = '';
    let bv = '';
    switch (sortKey) {
      case 'worker_name': av = a.worker_name; bv = b.worker_name; break;
      case 'company': av = a.company; bv = b.company; break;
      case 'role': av = a.role; bv = b.role; break;
      case 'check_in_time': av = a.check_in_time || 'zzz'; bv = b.check_in_time || 'zzz'; break;
      case 'check_out_time': av = a.check_out_time || 'zzz'; bv = b.check_out_time || 'zzz'; break;
      case 'status': av = a.status; bv = b.status; break;
    }
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const headers: { label: string; key: SortKey }[] = [
    { label: '이름', key: 'worker_name' },
    { label: '소속', key: 'company' },
    { label: '직무', key: 'role' },
    { label: '출근시간', key: 'check_in_time' },
    { label: '퇴근시간', key: 'check_out_time' },
    { label: '출근율', key: 'status' },
    { label: '상태', key: 'status' },
  ];

  return (
    <div
      style={{
        background: 'var(--gx-white)',
        borderRadius: 'var(--radius-gx-lg)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
        marginBottom: '24px',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gx-cloud)' }}>
              {headers.map(({ label, key }, i) => (
                <th
                  key={`${key}-${i}`}
                  onClick={() => handleSort(key)}
                  style={{
                    padding: '12px 20px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--gx-steel)',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {label}
                    {sortKey === key && (
                      <span style={{ color: 'var(--gx-accent)' }}>
                        {sortDir === 'asc' ? <SortUpIcon /> : <SortDownIcon />}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: 'center',
                    padding: '48px 20px',
                    fontSize: '13px',
                    color: 'var(--gx-steel)',
                  }}
                >
                  조건에 맞는 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              sorted.map((record, idx) => {
                const dotColor = COMPANY_COLORS[record.company] || '#64748B';
                const rate = record.status === 'not_checked' ? 0 : 100;
                return (
                  <tr
                    key={`${record.worker_id}-${idx}`}
                    style={{ transition: 'background 0.12s', borderBottom: '1px solid var(--gx-cloud)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = 'var(--gx-accent-soft)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--gx-graphite)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--gx-charcoal)' }}>
                        {record.worker_name}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--gx-graphite)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '2px',
                            background: dotColor,
                            flexShrink: 0,
                          }}
                        />
                        {record.company}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--gx-graphite)' }}>
                      {record.role}
                    </td>
                    <td
                      style={{
                        padding: '14px 20px',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '12px',
                        color: 'var(--gx-charcoal)',
                      }}
                    >
                      {formatTime(record.check_in_time)}
                    </td>
                    <td
                      style={{
                        padding: '14px 20px',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '12px',
                        color: 'var(--gx-charcoal)',
                      }}
                    >
                      {formatTime(record.check_out_time)}
                    </td>
                    <td style={{ padding: '14px 20px', minWidth: '160px' }}>
                      <ProgressBar rate={rate} />
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <StatusBadge status={record.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
