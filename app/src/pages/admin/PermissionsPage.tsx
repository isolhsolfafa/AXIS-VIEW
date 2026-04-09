// src/pages/admin/PermissionsPage.tsx
// 권한 관리 페이지 — 작업자 목록 + Manager 권한 Toggle

import { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/store/authStore';
import { useWorkers, useToggleManager, useRequestDeactivation, useWorkerStatus } from '@/hooks/useWorkers';
import { toast } from 'sonner';

/* ── 회사별 색상 ─────────────────────────────────────── */
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
      {company}
    </span>
  );
}

/* ── 역할 한글 매핑 ──────────────────────────────────── */
const ROLE_LABELS: Record<string, string> = {
  ADMIN: '관리자',
  MECH: '기구',
  ELEC: '전장',
  TM: 'TM',
  PI: 'PI',
  QI: 'QI',
  SI: 'SI',
};

/* ── 페이지 ──────────────────────────────────────────── */
export default function PermissionsPage() {
  const { user: currentUser } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const { data, isLoading, isError } = useWorkers(
    showAll ? undefined : { is_manager: true }
  );
  const toggleMutation = useToggleManager();
  const deactivateMutation = useRequestDeactivation();
  const workerStatusMutation = useWorkerStatus();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState('');

  const allWorkers = data?.workers ?? [];

  // Manager는 자기 회사만 표시
  const workers = useMemo(() => {
    if (currentUser?.is_admin) return allWorkers;
    if (currentUser?.is_manager) return allWorkers.filter((w) => w.company === currentUser.company);
    return allWorkers;
  }, [allWorkers, currentUser]);

  // 필터링
  const filtered = useMemo(() => {
    let list = workers;
    if (filterCompany) list = list.filter((w) => w.company === filterCompany);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.email.toLowerCase().includes(q) ||
          w.company.toLowerCase().includes(q)
      );
    }
    return list;
  }, [workers, filterCompany, searchQuery]);

  // 회사 목록 (필터용)
  const companies = useMemo(() => {
    const set = new Set(workers.map((w) => w.company));
    return [...set].sort();
  }, [workers]);

  // Toggle 핸들러
  const handleToggle = (workerId: number, currentValue: boolean, workerName: string) => {
    const newValue = !currentValue;
    toggleMutation.mutate(
      { workerId, isManager: newValue },
      {
        onSuccess: () => {
          toast.success(`${workerName} — 관리자 권한 ${newValue ? '부여' : '해제'}`);
        },
        onError: () => {
          toast.error('권한 변경에 실패했습니다');
        },
      }
    );
  };

  // KPI
  const totalWorkers = workers.length;
  const adminCount = workers.filter((w) => w.is_admin).length;
  const managerCount = workers.filter((w) => w.is_manager && !w.is_admin).length;

  return (
    <Layout title="QR 관리">
      <div style={{ padding: '24px', maxWidth: '1280px' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: '20px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--gx-charcoal)',
              margin: 0,
            }}
          >
            권한 관리
          </h2>
          <p
            style={{
              fontSize: '12px',
              color: 'var(--gx-steel)',
              margin: '4px 0 0',
            }}
          >
            작업자 목록 조회 및 협력사 관리자(Manager) 권한 부여/해제
          </p>
        </div>

        {/* KPI 카드 */}
        <div
          className="kpi-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          {[
            { label: '전체 작업자', value: totalWorkers, color: 'var(--gx-charcoal)' },
            { label: 'Admin', value: adminCount, color: 'var(--gx-accent)' },
            { label: 'Manager', value: managerCount, color: 'var(--gx-success)' },
          ].map((kpi) => (
            <div
              key={kpi.label}
              style={{
                background: 'var(--gx-white)',
                borderRadius: 'var(--radius-gx-lg, 12px)',
                border: '1px solid var(--gx-mist)',
                padding: '16px 20px',
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--gx-steel)', marginBottom: '4px' }}>
                {kpi.label}
              </div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: kpi.color,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {isLoading ? '—' : kpi.value}
              </div>
            </div>
          ))}
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
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-gx-md)',
              border: '1px solid var(--gx-mist)',
              fontSize: '13px',
              background: 'var(--gx-cloud)',
              color: 'var(--gx-graphite)',
            }}
          >
            <option value="">전체 회사</option>
            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="이름, 이메일 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-gx-md)',
              border: '1px solid var(--gx-mist)',
              fontSize: '13px',
              flex: 1,
              maxWidth: '280px',
              color: 'var(--gx-graphite)',
            }}
          />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--gx-steel)' }}>
              {isLoading ? '로딩...' : `${showAll ? '전체' : 'Manager'} ${filtered.length}명`}
            </span>
            <button
              onClick={() => setShowAll(!showAll)}
              style={{
                fontSize: '11px', fontWeight: 500, padding: '5px 12px',
                borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
                border: '1px solid',
                ...(showAll
                  ? { background: 'var(--gx-accent)', color: '#fff', borderColor: 'var(--gx-accent)' }
                  : { background: 'var(--gx-snow)', color: 'var(--gx-steel)', borderColor: 'var(--gx-mist)' }
                ),
              }}
            >
              {showAll ? '전체 보기 중' : '전체 보기'}
            </button>
          </div>
        </div>

        {/* 에러 */}
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

        {/* 작업자 테이블 */}
        <div
          style={{
            background: 'var(--gx-white)',
            borderRadius: 'var(--radius-gx-lg, 12px)',
            border: '1px solid var(--gx-mist)',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--gx-cloud)', borderBottom: '1px solid var(--gx-mist)' }}>
                {['이름', '이메일', '회사', '역할', '상태', 'Manager', ''].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
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
                    }}
                  >
                    데이터를 불러오는 중...
                  </td>
                </tr>
              )}
              {!isLoading &&
                filtered.map((w) => {
                  const isCurrentUser = w.id === currentUser?.id;
                  const isAdmin = w.is_admin;
                  const canToggle = !isAdmin && !isCurrentUser;

                  return (
                    <tr
                      key={w.id}
                      style={{
                        borderBottom: '1px solid var(--gx-cloud, #F8FAFC)',
                      }}
                    >
                      <td
                        style={{
                          padding: '10px 16px',
                          fontWeight: 500,
                          color: 'var(--gx-charcoal)',
                        }}
                      >
                        {w.name}
                        {isCurrentUser && (
                          <span
                            style={{
                              marginLeft: '6px',
                              fontSize: '10px',
                              color: 'var(--gx-accent)',
                              fontWeight: 600,
                            }}
                          >
                            (나)
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: '10px 16px',
                          color: 'var(--gx-steel)',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                        }}
                      >
                        {w.email}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <CompanyBadge company={w.company} />
                      </td>
                      <td
                        style={{
                          padding: '10px 16px',
                          color: 'var(--gx-slate)',
                          fontSize: '12px',
                        }}
                      >
                        {ROLE_LABELS[w.role] ?? w.role}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        {isAdmin ? (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'var(--gx-accent-soft)',
                              color: 'var(--gx-accent)',
                            }}
                          >
                            Admin
                          </span>
                        ) : w.is_manager ? (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'var(--gx-success-bg)',
                              color: 'var(--gx-success)',
                            }}
                          >
                            Manager
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 500,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'var(--gx-cloud)',
                              color: 'var(--gx-steel)',
                            }}
                          >
                            일반
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        {isAdmin ? (
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--gx-steel)',
                              opacity: 0.5,
                            }}
                          >
                            —
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              canToggle && handleToggle(w.id, w.is_manager, w.name)
                            }
                            disabled={!canToggle || toggleMutation.isPending}
                            style={{
                              width: '40px',
                              height: '22px',
                              borderRadius: '11px',
                              border: 'none',
                              cursor: canToggle ? 'pointer' : 'not-allowed',
                              background: w.is_manager
                                ? 'var(--gx-success, #10B981)'
                                : 'var(--gx-silver, #B8BCC8)',
                              position: 'relative',
                              transition: 'background 0.2s',
                              opacity: canToggle ? 1 : 0.5,
                            }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                top: '2px',
                                left: w.is_manager ? '20px' : '2px',
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: '#fff',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                transition: 'left 0.2s',
                              }}
                            />
                          </button>
                        )}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        {!isCurrentUser && !w.is_admin && (
                          currentUser?.is_admin || (currentUser?.is_manager && w.company === currentUser.company)
                        ) && (
                          <button
                            onClick={() => {
                              if (currentUser?.is_admin) {
                                const confirmed = confirm(`${w.name} 님을 정말 비활성화 하시겠습니까?\n이 작업은 즉시 반영됩니다.`);
                                if (!confirmed) return;
                                workerStatusMutation.mutate(
                                  { workerId: w.id, action: 'deactivate' },
                                  {
                                    onSuccess: () => toast.success(`${w.name} — 비활성화 완료`),
                                    onError: (err: any) => {
                                      const msg = err?.response?.data?.error;
                                      if (msg === 'NO_CHANGE') {
                                        toast.error('이미 비활성화된 사용자입니다');
                                      } else {
                                        toast.error('비활성화에 실패했습니다');
                                      }
                                    },
                                  }
                                );
                              } else {
                                const reason = prompt(`${w.name} 비활성화 사유를 입력하세요:`);
                                if (reason === null) return;
                                deactivateMutation.mutate(
                                  { workerId: w.id, reason: reason || '' },
                                  {
                                    onSuccess: () => toast.success(`${w.name} — 비활성화 요청 완료 (admin 승인 대기)`),
                                    onError: (err: any) => {
                                      const msg = err?.response?.data?.error;
                                      if (msg === 'NO_CHANGE') {
                                        toast.error('이미 비활성화 요청된 사용자입니다');
                                      } else {
                                        toast.error('비활성화 요청에 실패했습니다');
                                      }
                                    },
                                  }
                                );
                              }
                            }}
                            disabled={deactivateMutation.isPending || workerStatusMutation.isPending}
                            style={{
                              fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px',
                              border: 'none', cursor: 'pointer',
                              background: 'var(--gx-danger-bg)', color: 'var(--gx-danger)',
                              opacity: (deactivateMutation.isPending || workerStatusMutation.isPending) ? 0.5 : 1,
                              transition: 'all 0.15s',
                            }}
                          >
                            {currentUser?.is_admin ? '비활성화' : '비활성화 요청'}
                          </button>
                        )}
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
                    }}
                  >
                    표시할 작업자가 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
