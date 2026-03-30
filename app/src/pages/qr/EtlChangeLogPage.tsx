// src/pages/qr/EtlChangeLogPage.tsx
// ETL 변경 이력 페이지 — OPS BE API 연동
// GET /api/admin/etl/changes

import { useState, useMemo, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useEtlChanges } from '@/hooks/useEtlChanges';
import type { ChangeLogEntry } from '@/api/etl';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

/* ── 필드 설정 ─────────────────────────────────────── */
const FIELD_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ship_plan_date: { label: '출하예정', color: '#3B82F6', bg: '#EFF6FF' },
  mech_start:     { label: '기구시작', color: '#F59E0B', bg: '#FFFBEB' },
  pi_start:       { label: '가압시작', color: '#EC4899', bg: '#FDF2F8' },
  mech_partner:   { label: '기구외주', color: '#10B981', bg: '#ECFDF5' },
  elec_partner:   { label: '전장외주', color: '#8B5CF6', bg: '#F5F3FF' },
  sales_order:         { label: '판매오더',     color: '#EF4444', bg: '#FEF2F2' },
  finishing_plan_end:  { label: '마무리계획',   color: '#14B8A6', bg: '#F0FDFA' },
};

const DATE_FIELDS = new Set(['ship_plan_date', 'mech_start', 'pi_start', 'finishing_plan_end']);

const PERIOD_OPTIONS = [
  { value: 1, label: '오늘' },
  { value: 7, label: '최근 7일' },
  { value: 14, label: '최근 14일' },
  { value: 30, label: '최근 30일' },
];

/* ── 유틸 ──────────────────────────────────────────── */
function dateDiff(oldVal: string, newVal: string): string | null {
  if (!oldVal || !newVal) return null;
  try {
    const diff = Math.round(
      (new Date(newVal).getTime() - new Date(oldVal).getTime()) / 86_400_000
    );
    if (diff > 0) return `+${diff}d`;
    if (diff < 0) return `${diff}d`;
    return null;
  } catch {
    return null;
  }
}

function fmtDate(iso: string) { return iso.slice(5, 10); }

function buildWeeklyChart(changes: ChangeLogEntry[]) {
  const weeks: Record<string, Record<string, number>> = {};
  for (const c of changes) {
    const d = new Date(c.changed_at);
    const ws = new Date(d);
    ws.setDate(d.getDate() - d.getDay() + 1);
    const key = `${ws.getMonth() + 1}/${ws.getDate()}`;
    if (!weeks[key]) weeks[key] = { 출하예정: 0, 기구시작: 0, 가압시작: 0, 협력사: 0, 판매오더: 0, 마무리계획: 0 };
    if (c.field_name === 'ship_plan_date') weeks[key]['출하예정']++;
    else if (c.field_name === 'mech_start') weeks[key]['기구시작']++;
    else if (c.field_name === 'pi_start') weeks[key]['가압시작']++;
    else if (c.field_name === 'mech_partner' || c.field_name === 'elec_partner') weeks[key]['협력사']++;
    else if (c.field_name === 'sales_order') weeks[key]['판매오더']++;
    else if (c.field_name === 'finishing_plan_end') weeks[key]['마무리계획']++;
  }
  return Object.entries(weeks)
    .map(([week, counts]) => ({ week, ...counts }))
    .reverse();
}

/* ── 페이지 컴포넌트 ───────────────────────────────── */
export default function EtlChangeLogPage() {
  const [period, setPeriod] = useState(1);
  const [filterField, setFilterField] = useState('all');
  const [searchSN, setSearchSN] = useState('');

  // API 호출
  const { data, isLoading, isError } = useEtlChanges({
    days: period,
    field: filterField !== 'all' ? filterField : undefined,
    serial_number: searchSN.trim() || undefined,
    limit: 200,
  });

  const changes = data?.changes ?? [];
  const summary = data?.summary ?? { total_changes: 0, by_field: {} };

  // 읽음 처리: 페이지 진입 시 최대 change ID를 localStorage에 저장
  useEffect(() => {
    if (changes.length === 0) return;
    const maxId = Math.max(...changes.map((c) => c.id));
    const lastSeenId = Number(localStorage.getItem('axis_view_last_seen_change_id') || '0');
    if (maxId > lastSeenId) {
      localStorage.setItem('axis_view_last_seen_change_id', String(maxId));
    }
  }, [changes]);

  // 테이블 표시용 (API가 이미 필터링해서 반환하지만, FE에서도 동일 필터 적용)
  const filtered = useMemo(() => {
    let list = changes;
    if (filterField !== 'all') list = list.filter((c) => c.field_name === filterField);
    if (searchSN.trim())
      list = list.filter((c) =>
        c.serial_number.toLowerCase().includes(searchSN.toLowerCase())
      );
    return list;
  }, [changes, filterField, searchSN]);

  const chartData = useMemo(() => buildWeeklyChart(changes), [changes]);

  // KPI 카드 데이터 (summary 활용)
  const kpiCards = [
    { key: 'all', label: '전체 변경', count: summary.total_changes, color: '#1E293B', bg: '#1E293B' },
    ...['ship_plan_date', 'mech_start', 'pi_start', 'mech_partner', 'elec_partner', 'finishing_plan_end'].map((k) => ({
      key: k,
      label: FIELD_CONFIG[k].label,
      count: summary.by_field[k] || 0,
      color: FIELD_CONFIG[k].color,
      bg: FIELD_CONFIG[k].color,
    })),
  ];

  return (
    <Layout title="QR 관리">
      <div style={{ padding: '24px', maxWidth: '1280px' }}>
        {/* 헤더 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--gx-charcoal)',
                margin: 0,
              }}
            >
              ETL 변경 이력
            </h2>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--gx-steel)',
                margin: '4px 0 0',
              }}
            >
              SCR 생산현황 Excel → DB 적재 시 핵심 필드 변동 추적
            </p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-gx-md)',
              border: '1px solid var(--gx-mist)',
              fontSize: '13px',
              background: 'var(--gx-white)',
              cursor: 'pointer',
              color: 'var(--gx-graphite)',
            }}
          >
            {PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* KPI 카드 */}
        <div
          className="kpi-grid-7"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          {kpiCards.map((card) => {
            const isActive = filterField === card.key;
            return (
              <div
                key={card.key}
                onClick={() => setFilterField(isActive && card.key !== 'all' ? 'all' : card.key)}
                style={{
                  background: isActive ? card.bg : 'var(--gx-white)',
                  color: isActive ? '#fff' : 'var(--gx-charcoal)',
                  borderRadius: 'var(--radius-gx-lg, 12px)',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  border: `1px solid ${isActive ? card.bg : 'var(--gx-mist)'}`,
                  transition: 'all 0.15s',
                  boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>
                  {card.label}
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>
                  {isLoading ? '—' : card.count}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.5 }}>
                  {card.key === 'all' ? `최근 ${period}일` : '건'}
                </div>
              </div>
            );
          })}
        </div>

        {/* 필터 바 */}
        <div
          style={{
            background: 'var(--gx-white)',
            borderRadius: 'var(--radius-gx-lg, 12px)',
            border: '1px solid var(--gx-mist)',
            padding: '12px 20px',
            marginBottom: '16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <select
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-gx-md)',
              border: '1px solid var(--gx-mist)',
              fontSize: '13px',
              background: 'var(--gx-cloud)',
              color: 'var(--gx-graphite)',
            }}
          >
            <option value="all">전체 항목</option>
            {Object.entries(FIELD_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="S/N 검색..."
            value={searchSN}
            onChange={(e) => setSearchSN(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-gx-md)',
              border: '1px solid var(--gx-mist)',
              fontSize: '13px',
              flex: 1,
              maxWidth: '240px',
              color: 'var(--gx-graphite)',
            }}
          />
          <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--gx-steel)' }}>
            {isLoading ? '로딩...' : `${filtered.length}건 표시`}
          </div>
        </div>

        {/* 에러 표시 */}
        {isError && (
          <div
            style={{
              padding: '16px 20px',
              marginBottom: '16px',
              borderRadius: 'var(--radius-gx-lg, 12px)',
              background: 'var(--gx-danger-bg, #FEF2F2)',
              border: '1px solid var(--gx-danger, #EF4444)',
              color: 'var(--gx-danger, #EF4444)',
              fontSize: '13px',
            }}
          >
            데이터를 불러오지 못했습니다. 새로고침하거나 잠시 후 다시 시도해주세요.
          </div>
        )}

        {/* 변경 이력 테이블 */}
        <div
          style={{
            background: 'var(--gx-white)',
            borderRadius: 'var(--radius-gx-lg, 12px)',
            border: '1px solid var(--gx-mist)',
            overflow: 'hidden',
            marginBottom: '20px',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--gx-cloud)', borderBottom: '1px solid var(--gx-mist)' }}>
                {['O/N', 'S/N', 'Model', '변경 항목', '이전 값', '변경 값', '변경일'].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 16px',
                      textAlign: i === 6 ? 'right' : 'left',
                      fontWeight: 600,
                      color: 'var(--gx-steel)',
                      fontSize: '12px',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: '40px 16px',
                      textAlign: 'center',
                      color: 'var(--gx-steel)',
                      fontSize: '13px',
                    }}
                  >
                    데이터를 불러오는 중...
                  </td>
                </tr>
              )}
              {!isLoading && filtered.map((c) => {
                const cfg = FIELD_CONFIG[c.field_name] || {
                  label: c.field_label || c.field_name,
                  color: '#64748B',
                  bg: '#F1F5F9',
                };
                const isDate = DATE_FIELDS.has(c.field_name);
                const diff = isDate ? dateDiff(c.old_value, c.new_value) : null;
                const diffColor = diff?.startsWith('+') ? 'var(--gx-danger)' : 'var(--gx-success)';

                return (
                  <tr
                    key={c.id}
                    style={{ borderBottom: '1px solid var(--gx-cloud, #F8FAFC)' }}
                  >
                    <td
                      style={{
                        padding: '10px 16px',
                        fontWeight: 500,
                        color: 'var(--gx-charcoal)',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                      }}
                    >
                      {c.sales_order || '—'}
                    </td>
                    <td
                      style={{
                        padding: '10px 16px',
                        fontWeight: 500,
                        color: 'var(--gx-charcoal)',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                      }}
                    >
                      {c.serial_number}
                    </td>
                    <td
                      style={{
                        padding: '10px 16px',
                        color: 'var(--gx-steel)',
                        fontSize: '12px',
                      }}
                    >
                      {c.model}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: cfg.bg,
                          color: cfg.color,
                        }}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '10px 16px',
                        color: 'var(--gx-steel)',
                        textDecoration: 'line-through',
                      }}
                    >
                      {isDate ? fmtDate(c.old_value) : c.old_value}
                    </td>
                    <td
                      style={{
                        padding: '10px 16px',
                        color: 'var(--gx-charcoal)',
                        fontWeight: 500,
                      }}
                    >
                      {isDate ? fmtDate(c.new_value) : c.new_value}
                      {diff && (
                        <span
                          style={{
                            marginLeft: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: diffColor,
                          }}
                        >
                          ({diff})
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: '10px 16px',
                        textAlign: 'right',
                        color: 'var(--gx-steel)',
                        fontSize: '12px',
                      }}
                    >
                      {fmtDate(c.changed_at)}
                    </td>
                  </tr>
                );
              })}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: '40px 16px',
                      textAlign: 'center',
                      color: 'var(--gx-steel)',
                      fontSize: '13px',
                    }}
                  >
                    변경 이력이 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 주간 추이 차트 */}
        <div
          style={{
            background: 'var(--gx-white)',
            borderRadius: 'var(--radius-gx-lg, 12px)',
            border: '1px solid var(--gx-mist)',
            padding: '20px',
          }}
        >
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--gx-charcoal)',
              margin: '0 0 16px',
            }}
          >
            주간 변경 추이
          </h3>
          {changes.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gx-mist)" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 12, fill: 'var(--gx-steel)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'var(--gx-steel)' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--gx-mist)',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="출하예정" stackId="a" fill="#3B82F6" />
                <Bar dataKey="기구시작" stackId="a" fill="#F59E0B" />
                <Bar dataKey="가압시작" stackId="a" fill="#EC4899" />
                <Bar dataKey="협력사" stackId="a" fill="#10B981" />
                <Bar dataKey="판매오더" stackId="a" fill="#EF4444" />
                <Bar dataKey="마무리계획" stackId="a" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gx-steel)', fontSize: '13px' }}>
              {isLoading ? '차트 데이터 로딩 중...' : '표시할 데이터가 없습니다'}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
