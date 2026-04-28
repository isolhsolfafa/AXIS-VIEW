// src/pages/admin/InactiveWorkersPage.tsx
// 비활성 사용자 관리 — Sprint 40-C VIEW 연동

import { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { useInactiveWorkers, useDeactivatedWorkers, useWorkerStatus } from '@/hooks/useWorkers';
import { toast } from 'sonner';
import type { InactiveWorker } from '@/api/workers';
import { formatDate } from '@/utils/format';

const COMPANY_COLORS: Record<string, { bg: string; color: string }> = {
  GST:      { bg: '#EEF2FF', color: '#4F46E5' },
  FNI:      { bg: '#ECFDF5', color: '#059669' },
  BAT:      { bg: '#FEF3C7', color: '#D97706' },
  'TMS(M)': { bg: '#FCE7F3', color: '#DB2777' },
  'TMS(E)': { bg: '#EDE9FE', color: '#7C3AED' },
  'P&S':    { bg: '#E0F2FE', color: '#0284C7' },
  'C&A':    { bg: '#FEF2F2', color: '#DC2626' },
};

function CompanyBadge({ company }: { company: string }) {
  const cfg = COMPANY_COLORS[company] ?? { bg: '#F1F5F9', color: '#64748B' };
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: cfg.bg, color: cfg.color }}>
      {company}
    </span>
  );
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: '관리자', MECH: '기구', ELEC: '전장', TM: 'TM', PI: 'PI', QI: 'QI', SI: 'SI',
};

function daysSince(iso: string | null): string {
  if (!iso) return '—';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return `${diff}일 전`;
}

type Tab = 'inactive' | 'deactivated';

export default function InactiveWorkersPage() {
  const [tab, setTab] = useState<Tab>('inactive');
  const [search, setSearch] = useState('');
  const { data: inactiveData, isLoading: inactiveLoading } = useInactiveWorkers(30);
  const { data: deactivatedData, isLoading: deactivatedLoading } = useDeactivatedWorkers();
  const statusMutation = useWorkerStatus();

  const inactiveWorkers = inactiveData?.inactive_workers ?? [];
  const deactivatedWorkers = deactivatedData?.deactivated_workers ?? [];

  const currentList = tab === 'inactive' ? inactiveWorkers : deactivatedWorkers;
  const isLoading = tab === 'inactive' ? inactiveLoading : deactivatedLoading;

  const filtered = useMemo(() => {
    if (!search.trim()) return currentList;
    const q = search.toLowerCase();
    return currentList.filter(w =>
      w.name.toLowerCase().includes(q) ||
      w.email.toLowerCase().includes(q) ||
      w.company.toLowerCase().includes(q)
    );
  }, [currentList, search]);

  const handleAction = (worker: InactiveWorker, action: 'deactivate' | 'reactivate') => {
    const label = action === 'deactivate' ? '비활성화' : '재활성화';
    if (!confirm(`${worker.name} (${worker.company})을(를) ${label}하시겠습니까?`)) return;

    statusMutation.mutate(
      { workerId: worker.id, action },
      {
        onSuccess: () => toast.success(`${worker.name} — ${label} 완료`),
        onError: () => toast.error(`${label}에 실패했습니다`),
      }
    );
  };

  return (
    <Layout title="비활성 사용자 관리">
      <div style={{ padding: '24px', maxWidth: '1280px' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gx-charcoal)', margin: 0 }}>
            비활성 사용자 관리
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--gx-steel)', margin: '4px 0 0' }}>
            30일 이상 미로그인 사용자 조회 및 계정 비활성화/재활성화
          </p>
        </div>

        {/* KPI 카드 */}
        <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: '미로그인 (30일+)', value: inactiveData?.count ?? 0, color: 'var(--gx-warning)' },
            { label: '비활성화됨', value: deactivatedData?.count ?? 0, color: 'var(--gx-danger)' },
            { label: '기준 일수', value: `${inactiveData?.threshold_days ?? 30}일`, color: 'var(--gx-steel)' },
          ].map(kpi => (
            <div key={kpi.label} style={{ background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg, 12px)', border: '1px solid var(--gx-mist)', padding: '16px 20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--gx-steel)', marginBottom: '4px' }}>{kpi.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: kpi.color, fontFamily: "'JetBrains Mono', monospace" }}>
                {inactiveLoading || deactivatedLoading ? '—' : kpi.value}
              </div>
            </div>
          ))}
        </div>

        {/* 탭 + 검색 */}
        <div style={{ background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg, 12px)', border: '1px solid var(--gx-mist)', padding: '12px 20px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          {(['inactive', 'deactivated'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '6px 14px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: tab === t ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s',
                background: tab === t ? 'var(--gx-accent)' : 'var(--gx-cloud)',
                color: tab === t ? '#fff' : 'var(--gx-slate)',
              }}
            >
              {t === 'inactive' ? `미로그인 (${inactiveData?.count ?? 0})` : `비활성화됨 (${deactivatedData?.count ?? 0})`}
            </button>
          ))}
          <input
            type="text"
            placeholder="이름, 이메일 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 'var(--radius-gx-md)', border: '1px solid var(--gx-mist)', fontSize: '13px', flex: 1, maxWidth: '280px', color: 'var(--gx-graphite)' }}
          />
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--gx-steel)' }}>
            {isLoading ? '로딩...' : `${filtered.length}명`}
          </span>
        </div>

        {/* 테이블 */}
        <div style={{ background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg, 12px)', border: '1px solid var(--gx-mist)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--gx-cloud)', borderBottom: '1px solid var(--gx-mist)' }}>
                  {['이름', '이메일', '회사', '역할', tab === 'inactive' ? '마지막 로그인' : '비활성화 일시', '가입일', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--gx-steel)', fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--gx-steel)' }}>데이터를 불러오는 중...</td></tr>
                )}
                {!isLoading && filtered.map(w => (
                  <tr key={w.id} style={{ borderBottom: '1px solid var(--gx-cloud)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 500, color: 'var(--gx-charcoal)' }}>{w.name}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--gx-steel)', fontSize: '12px', fontFamily: 'monospace' }}>{w.email}</td>
                    <td style={{ padding: '10px 16px' }}><CompanyBadge company={w.company} /></td>
                    <td style={{ padding: '10px 16px', color: 'var(--gx-slate)', fontSize: '12px' }}>{ROLE_LABELS[w.role] ?? w.role}</td>
                    <td style={{ padding: '10px 16px', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
                      {tab === 'inactive' ? (
                        <span style={{ color: w.last_login_at ? 'var(--gx-warning)' : 'var(--gx-danger)' }}>
                          {w.last_login_at ? daysSince(w.last_login_at) : '로그인 기록 없음'}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--gx-danger)' }}>{formatDate(w.deactivated_at, { fallback: '없음' })}</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--gx-steel)', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
                      {formatDate(w.created_at, { fallback: '없음' })}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      {tab === 'inactive' ? (
                        <button
                          onClick={() => handleAction(w, 'deactivate')}
                          disabled={statusMutation.isPending}
                          style={{
                            fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            background: 'var(--gx-danger-bg)', color: 'var(--gx-danger)', transition: 'all 0.15s',
                            opacity: statusMutation.isPending ? 0.5 : 1,
                          }}
                        >
                          비활성화
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(w, 'reactivate')}
                          disabled={statusMutation.isPending}
                          style={{
                            fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            background: 'var(--gx-success-bg)', color: 'var(--gx-success)', transition: 'all 0.15s',
                            opacity: statusMutation.isPending ? 0.5 : 1,
                          }}
                        >
                          재활성화
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!isLoading && filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--gx-steel)' }}>
                    {tab === 'inactive' ? '미로그인 사용자가 없습니다' : '비활성화된 사용자가 없습니다'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
