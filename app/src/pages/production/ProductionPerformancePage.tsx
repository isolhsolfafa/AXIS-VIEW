// src/pages/production/ProductionPerformancePage.tsx
// 생산실적 — O/N 단위 주간·월간 실적 관리
// 카톡→PPS→카톡 프로세스 대체 → OPS progress 100% → 공정별 실적확인 → 재무회계 근거
// 실적확인 단위: O/N × 공정(MECH/ELEC/TM) 개별 확인
// DB: plan.production_confirm (Core DB)

import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { usePerformance, useMonthlySummary, useConfirmProduction, useCancelConfirm } from '@/hooks/useProduction';
import type { ConfirmRecord } from '@/types/production';
import { useAuth } from '@/store/authStore';
import { useAdminSettings, useUpdateAdminSettings } from '@/hooks/useAdminSettings';

/* ─── MiniProgress ─────────────────────────────────── */
function MiniProgress({ value, total }: { value: number; total?: number }) {
  if (total === 0) return <span style={{ fontSize: '10px', color: 'var(--gx-silver)', fontStyle: 'italic' }}>N/A</span>;
  const color = value >= 100 ? 'var(--gx-success)' : value > 0 ? 'var(--gx-accent)' : 'var(--gx-mist)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div style={{ width: '44px', height: '4px', borderRadius: '2px', background: 'var(--gx-cloud)', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', borderRadius: '2px', background: color, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600, color, minWidth: '28px' }}>
        {value >= 100 ? '100%' : `${value}%`}
      </span>
    </div>
  );
}

/* ─── ConfirmSettingsPanel — 실적확인 설정 패널 ────── */
function ConfirmSettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: settings, isLoading } = useAdminSettings();
  const updateMutation = useUpdateAdminSettings();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey); };
  }, [open, onClose]);

  if (!open) return null;

  const TOGGLES = [
    { key: 'confirm_mech_enabled', label: '기구 (MECH)' },
    { key: 'confirm_elec_enabled', label: '전장 (ELEC)' },
    { key: 'confirm_tm_enabled', label: 'Tank Module (TM)' },
    { key: 'confirm_pi_enabled', label: 'PI' },
    { key: 'confirm_qi_enabled', label: 'QI' },
    { key: 'confirm_si_enabled', label: 'SI' },
  ];

  const handleToggle = (key: string, currentValue: boolean) => {
    updateMutation.mutate({ [key]: !currentValue });
  };

  return (
    <div ref={panelRef} style={{
      position: 'absolute', top: '48px', right: '0', width: '300px', zIndex: 100,
      background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-md)',
      border: '1px solid var(--gx-mist)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
      padding: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--gx-mist)' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>실적확인 설정</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gx-steel)', fontSize: '16px' }}>&#10005;</button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gx-steel)', fontSize: '12px' }}>설정 불러오는 중...</div>
      ) : (
        <>
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--gx-steel)', marginBottom: '10px', letterSpacing: '0.3px', textTransform: 'uppercase' as const }}>공정별 실적확인</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {TOGGLES.map(t => {
              const value = (settings as Record<string, unknown>)?.[t.key] as boolean ?? false;
              return (
                <div key={t.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: value ? 'var(--gx-charcoal)' : 'var(--gx-steel)' }}>{t.label}</span>
                  <button onClick={() => handleToggle(t.key, value)} disabled={updateMutation.isPending} style={{
                    width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer', position: 'relative',
                    background: value ? 'var(--gx-accent)' : 'var(--gx-silver)', transition: 'background 0.2s',
                    opacity: updateMutation.isPending ? 0.6 : 1,
                  }}>
                    <span style={{
                      position: 'absolute', top: '2px', left: value ? '20px' : '2px',
                      width: '18px', height: '18px', borderRadius: '50%', background: 'var(--gx-white)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.2s',
                    }} />
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid var(--gx-mist)', margin: '14px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-charcoal)' }}>체크리스트 필수</span>
              <div style={{ fontSize: '10px', color: 'var(--gx-steel)', marginTop: '2px' }}>자주검사 완료 시에만 실적확인 가능</div>
            </div>
            <button onClick={() => handleToggle('confirm_checklist_required', (settings as Record<string, unknown>)?.confirm_checklist_required as boolean ?? false)} disabled={updateMutation.isPending} style={{
              width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer', position: 'relative',
              background: ((settings as Record<string, unknown>)?.confirm_checklist_required as boolean) ? 'var(--gx-accent)' : 'var(--gx-silver)', transition: 'background 0.2s',
            }}>
              <span style={{
                position: 'absolute', top: '2px', left: ((settings as Record<string, unknown>)?.confirm_checklist_required as boolean) ? '20px' : '2px',
                width: '18px', height: '18px', borderRadius: '50%', background: 'var(--gx-white)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.2s',
              }} />
            </button>
          </div>

          {updateMutation.isSuccess && <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--gx-success)', textAlign: 'center' }}>설정이 저장되었습니다.</div>}
          {updateMutation.isError && <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--gx-danger)', textAlign: 'center' }}>저장 실패</div>}
        </>
      )}
    </div>
  );
}

/* ─── ProcessCell — 공정별 인라인 확인 셀 ──────────── */
function ProcessCell({ processType, processStatus, confirms, partnerDisplay, mixed, onConfirm, confirmPending, enabled = true }: {
  processType: 'MECH' | 'ELEC' | 'TM';
  processStatus: { ready: number; total: number; confirmable: boolean };
  confirms: ConfirmRecord[];
  partnerDisplay: string;
  mixed: boolean;
  onConfirm: () => void;
  confirmPending: boolean;
  enabled?: boolean;
}) {
  const confirm = confirms.find(c => c.process_type === processType);
  const allDone = processStatus.ready === processStatus.total && processStatus.total > 0;

  if (processStatus.total === 0) {
    return (
      <td style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--gx-silver)', fontStyle: 'italic' }}>N/A</span>
          {/* N/A 상태에서도 협력사 + 혼재 마크 표시 */}
          {partnerDisplay && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ fontSize: '10px', color: 'var(--gx-steel)' }}>{partnerDisplay}</span>
              {mixed && (
                <span style={{
                  fontSize: '7.5px', fontWeight: 700, padding: '1px 4px', borderRadius: '3px',
                  background: 'rgba(245,158,11,0.1)', color: 'var(--gx-warning)',
                }}>혼재</span>
              )}
            </div>
          )}
        </div>
      </td>
    );
  }

  if (!enabled && processStatus.total > 0) {
    return (
      <td style={{ padding: '12px 14px', minWidth: '140px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', opacity: 0.5 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 700, color: 'var(--gx-silver)' }}>
            {processStatus.ready}/{processStatus.total}
          </span>
          <span style={{ fontSize: '9px', fontWeight: 600, padding: '2px 8px', borderRadius: '8px', background: 'var(--gx-cloud)', color: 'var(--gx-steel)', display: 'inline-block', width: 'fit-content' }}>
            확인 비활성
          </span>
        </div>
      </td>
    );
  }

  return (
    <td style={{ padding: '12px 14px', minWidth: '140px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* 완료 카운트 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px', fontWeight: 700,
            color: allDone ? 'var(--gx-success)' : 'var(--gx-accent)',
          }}>
            {processStatus.ready}/{processStatus.total}
          </span>

          {/* 확인 버튼/상태 */}
          {confirm ? (
            <span style={{
              fontSize: '9px', fontWeight: 600, padding: '2px 8px', borderRadius: '8px',
              background: 'rgba(16,185,129,0.08)', color: 'var(--gx-success)',
              display: 'inline-flex', alignItems: 'center', gap: '3px',
            }}>
              &#10003; 확인
            </span>
          ) : enabled && processStatus.confirmable && !confirm ? (
            <button
              onClick={(e) => { e.stopPropagation(); onConfirm(); }}
              disabled={confirmPending}
              style={{
                fontSize: '9px', fontWeight: 600, padding: '3px 10px', borderRadius: '8px',
                background: 'var(--gx-accent)', color: '#fff',
                border: 'none', cursor: confirmPending ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 4px rgba(99,102,241,0.3)',
                transition: 'all 0.15s',
                opacity: confirmPending ? 0.6 : 1,
              }}
            >
              {confirmPending ? '처리중...' : '실적확인'}
            </button>
          ) : null}
        </div>

        {/* 협력사 */}
        {partnerDisplay && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ fontSize: '10px', color: 'var(--gx-steel)' }}>{partnerDisplay}</span>
            {mixed && (
              <span style={{
                fontSize: '7.5px', fontWeight: 700, padding: '1px 4px', borderRadius: '3px',
                background: 'rgba(245,158,11,0.1)', color: 'var(--gx-warning)',
              }}>혼재</span>
            )}
          </div>
        )}

        {/* 확인 이력 */}
        {confirm && (
          <span style={{ fontSize: '8.5px', color: 'var(--gx-silver)', fontFamily: "'JetBrains Mono', monospace" }}>
            {confirm.confirmed_by} · {confirm.confirmed_at?.slice(5, 16)}
          </span>
        )}
      </div>
    </td>
  );
}

/* ─── 메인 ──────────────────────────────────────────── */
export default function ProductionPerformancePage() {
  const [activeWeek, setActiveWeek] = useState<string>('');
  const [activeView, setActiveView] = useState<'weekly' | 'monthly'>('weekly');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | 'done' | 'pending'>('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeProcessTab, setActiveProcessTab] = useState<'mech_elec' | 'tm'>('mech_elec');

  const { user } = useAuth();
  const isAdmin = user?.is_admin === true;

  const { data: adminSettings } = useAdminSettings();

  const isProcessEnabled = (pt: string): boolean => {
    const key = `confirm_${pt.toLowerCase()}_enabled`;
    return (adminSettings as Record<string, unknown>)?.[key] !== false;
  };

  // API data
  const { data: perfData, isLoading, isError, error } = usePerformance(
    activeWeek || undefined, undefined
  );
  const { data: monthlyData } = useMonthlySummary();
  const confirmMutation = useConfirmProduction();
  const cancelMutation = useCancelConfirm();
  // cancelMutation is available for future use (e.g., undo confirm)
  void cancelMutation;

  // Set initial week from API response
  useEffect(() => {
    if (perfData?.week && !activeWeek) setActiveWeek(perfData.week);
  }, [perfData?.week, activeWeek]);

  const toggleExpand = (on: string) => {
    setExpandedOrders(prev => { const n = new Set(prev); if (n.has(on)) n.delete(on); else n.add(on); return n; });
  };

  // 데이터
  const orders = perfData?.orders ?? [];

  // 공정 탭별 O/N 필터
  const tabOrders = orders.filter(o => {
    if (activeProcessTab === 'mech_elec') {
      return (o.processes?.MECH?.total ?? 0) > 0 || (o.processes?.ELEC?.total ?? 0) > 0;
    } else {
      return (o.processes?.TM?.total ?? 0) > 0;
    }
  });

  // 탭별 KPI 산출
  const mechConfirmedInTab = tabOrders.filter(o => (o.confirms ?? []).some(c => c.process_type === 'MECH')).length;
  const elecConfirmedInTab = tabOrders.filter(o => (o.confirms ?? []).some(c => c.process_type === 'ELEC')).length;
  const mechReadyInTab = tabOrders.filter(o => o.processes?.MECH?.confirmable && !(o.confirms ?? []).some(c => c.process_type === 'MECH')).length;
  const elecReadyInTab = tabOrders.filter(o => o.processes?.ELEC?.confirmable && !(o.confirms ?? []).some(c => c.process_type === 'ELEC')).length;
  const tmConfirmedInTab = tabOrders.filter(o => (o.confirms ?? []).some(c => c.process_type === 'TM')).length;
  const tmReadyInTab = tabOrders.filter(o => o.processes?.TM?.confirmable && !(o.confirms ?? []).some(c => c.process_type === 'TM')).length;

  // 상태 필터 (tabOrders 위에 적용)
  const filteredOrders = tabOrders.filter(o => {
    if (statusFilter === 'done') {
      const hasAll = (['MECH', 'ELEC'] as const).every(pt => (o.confirms ?? []).some(c => c.process_type === pt));
      const tmDone = (o.processes?.TM?.total ?? 0) === 0 || (o.confirms ?? []).some(c => c.process_type === 'TM');
      return hasAll && tmDone;
    }
    if (statusFilter === 'pending') {
      const hasAll = (['MECH', 'ELEC'] as const).every(pt => (o.confirms ?? []).some(c => c.process_type === pt));
      const tmDone = (o.processes?.TM?.total ?? 0) === 0 || (o.confirms ?? []).some(c => c.process_type === 'TM');
      return !(hasAll && tmDone);
    }
    return true;
  });

  const handleConfirm = (salesOrder: string, processType: 'MECH' | 'ELEC' | 'TM') => {
    confirmMutation.mutate({
      sales_order: salesOrder,
      process_type: processType,
      confirmed_week: perfData?.week ?? '',
      confirmed_month: perfData?.month ?? '',
    });
  };

  const handleBatchConfirm = async (processType: 'MECH' | 'ELEC' | 'TM') => {
    const confirmable = tabOrders.filter(o =>
      o.processes[processType]?.confirmable &&
      !(o.confirms ?? []).some(c => c.process_type === processType)
    );
    if (confirmable.length === 0) return;
    const labels = { MECH: '기구', ELEC: '전장', TM: 'TM' };
    if (!window.confirm(`${labels[processType]} 실적확인 ${confirmable.length}건을 일괄 처리하시겠습니까?`)) return;
    for (const o of confirmable) {
      await confirmMutation.mutateAsync({
        sales_order: o.sales_order,
        process_type: processType,
        confirmed_week: perfData?.week ?? '',
        confirmed_month: perfData?.month ?? '',
      });
    }
  };

  // 주차 탭: API 응답 기반 ± 2 weeks
  const currentWeekNum = perfData?.week ? parseInt(perfData.week.replace('W', '')) : 0;
  const weekTabs = currentWeekNum > 0 ? [-2, -1, 0, 1].map(offset => {
    const w = currentWeekNum + offset;
    return { label: `W${w}`, current: offset === 0 };
  }) : [];

  return (
    <Layout title="생산실적">
      <div style={{ padding: '28px 32px', maxWidth: '1600px' }}>

        {/* Workflow 안내 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          padding: '12px 20px', marginBottom: '20px',
          background: 'rgba(99,102,241,0.03)', borderRadius: 'var(--radius-gx-lg)',
          border: '1px solid rgba(99,102,241,0.1)',
        }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="var(--gx-accent)" style={{ flexShrink: 0 }}>
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 4a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.828a1 1 0 101.415-1.414L11 9.586V6z"/>
          </svg>
          <div style={{ fontSize: '11.5px', color: 'var(--gx-steel)' }}>
            OPS 공정 100% →
            <strong style={{ color: 'var(--gx-accent)', margin: '0 3px' }}>실적확인</strong>
            (공정별 개별) → 확인 이력 DB 저장 → 월마감 정산 → 재무·회계 근거
          </div>
        </div>

        {/* Loading / Error states */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gx-steel)' }}>데이터를 불러오는 중...</div>
        )}
        {isError && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gx-danger)' }}>
            데이터 로드 실패: {(error as Error)?.message}
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* KPI Cards — 탭별 */}
            <div style={{ display: 'grid', gridTemplateColumns: activeProcessTab === 'mech_elec' ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
              {(activeProcessTab === 'mech_elec' ? [
                { label: '주간 O/N', value: `${tabOrders.length}`, sub: `S/N ${tabOrders.reduce((s, o) => s + o.sn_count, 0)}대`, color: 'var(--gx-info)' },
                { label: '기구 확인', value: `${mechConfirmedInTab}/${tabOrders.length}`, sub: mechReadyInTab > 0 ? `${mechReadyInTab}건 확인 가능` : '대기', color: 'var(--gx-success)' },
                { label: '전장 확인', value: `${elecConfirmedInTab}/${tabOrders.length}`, sub: elecReadyInTab > 0 ? `${elecReadyInTab}건 확인 가능` : '대기', color: '#3B82F6' },
                { label: '월간 누적', value: monthlyData?.totals ? `${(monthlyData.totals.mech?.confirmed ?? 0) + (monthlyData.totals.elec?.confirmed ?? 0)}` : '—', sub: `${perfData?.month ?? ''} 기구·전장`, color: 'var(--gx-warning)' },
              ] : [
                { label: '주간 O/N', value: `${tabOrders.length}`, sub: `GAIA ${tabOrders.length}건`, color: 'var(--gx-info)' },
                { label: 'TM 확인', value: `${tmConfirmedInTab}/${tabOrders.length}`, sub: tmReadyInTab > 0 ? `${tmReadyInTab}건 확인 가능` : '대기', color: 'var(--gx-accent)' },
                { label: '월간 누적', value: monthlyData?.totals ? `${monthlyData.totals.tm?.confirmed ?? 0}` : '—', sub: `${perfData?.month ?? ''} TM`, color: 'var(--gx-warning)' },
              ]).map(k => (
                <div key={k.label} style={{
                  background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
                  padding: '18px 20px', boxShadow: 'var(--shadow-card)',
                }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 500, color: 'var(--gx-steel)', letterSpacing: '0.3px', marginBottom: '8px' }}>{k.label}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--gx-charcoal)', fontFamily: "'JetBrains Mono', monospace" }}>{k.value}</span>
                    <span style={{ fontSize: '10.5px', color: k.sub.includes('가능') ? k.color : 'var(--gx-steel)' }}>{k.sub}</span>
                  </div>
                  <div style={{ marginTop: '8px', height: '3px', borderRadius: '2px', background: 'var(--gx-cloud)' }}>
                    <div style={{ width: '55%', height: '100%', borderRadius: '2px', background: k.color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Toolbar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
              padding: '12px 20px', background: 'var(--gx-white)',
              borderRadius: 'var(--radius-gx-lg)', boxShadow: 'var(--shadow-card)',
              marginBottom: '14px',
            }}>
              {/* 주간/월마감 */}
              <div style={{ display: 'flex', background: 'var(--gx-cloud)', borderRadius: '10px', padding: '2px' }}>
                {(['weekly', 'monthly'] as const).map(v => (
                  <button key={v} onClick={() => setActiveView(v)} style={{
                    padding: '5px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                    background: activeView === v ? 'var(--gx-white)' : 'transparent',
                    color: activeView === v ? 'var(--gx-charcoal)' : 'var(--gx-steel)',
                    boxShadow: activeView === v ? 'var(--shadow-card)' : 'none',
                  }}>{v === 'weekly' ? '주간' : '월마감'}</button>
                ))}
              </div>

              <div style={{ width: '1px', height: '28px', background: 'var(--gx-mist)' }} />

              {activeView === 'weekly' ? (
                <>
                  {/* 주차 탭 */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {weekTabs.map(w => (
                      <button key={w.label} onClick={() => setActiveWeek(w.label)} style={{
                        padding: '5px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 500,
                        border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
                        ...(activeWeek === w.label
                          ? { background: 'var(--gx-accent)', color: '#fff', borderColor: 'var(--gx-accent)' }
                          : { background: 'transparent', color: 'var(--gx-slate)', borderColor: 'var(--gx-mist)' }),
                      }}>
                        {w.label}
                        {w.current && activeWeek !== w.label && (
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--gx-success)', display: 'inline-block', marginLeft: '3px', verticalAlign: 'middle' }} />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* 공정 그룹 탭 */}
                  <div style={{ width: '1px', height: '28px', background: 'var(--gx-mist)' }} />
                  <div style={{ display: 'flex', background: 'var(--gx-cloud)', borderRadius: '10px', padding: '2px' }}>
                    {([
                      { key: 'mech_elec', label: '기구·전장' },
                      { key: 'tm', label: 'TM(모듈)' },
                    ] as const).map(tab => (
                      <button key={tab.key} onClick={() => setActiveProcessTab(tab.key)} style={{
                        padding: '5px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
                        border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                        background: activeProcessTab === tab.key ? 'var(--gx-white)' : 'transparent',
                        color: activeProcessTab === tab.key ? 'var(--gx-charcoal)' : 'var(--gx-steel)',
                        boxShadow: activeProcessTab === tab.key ? 'var(--shadow-card)' : 'none',
                      }}>{tab.label}</button>
                    ))}
                  </div>

                  <div style={{ width: '1px', height: '28px', background: 'var(--gx-mist)' }} />

                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)} style={{
                    padding: '5px 12px', borderRadius: '10px', border: '1px solid var(--gx-mist)',
                    fontSize: '12px', color: 'var(--gx-graphite)', cursor: 'pointer', background: 'var(--gx-white)',
                  }}>
                    <option value="all">전체 상태</option>
                    <option value="done">전체 확인 완료</option>
                    <option value="pending">미완료 포함</option>
                  </select>

                  {/* 일괄 확인 — 탭별 */}
                  {activeProcessTab === 'mech_elec' && (mechReadyInTab > 0 || elecReadyInTab > 0) && (
                    <>
                      <div style={{ width: '1px', height: '28px', background: 'var(--gx-mist)' }} />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {mechReadyInTab > 0 && (
                          <button onClick={() => handleBatchConfirm('MECH')} style={{
                            fontSize: '11px', fontWeight: 600, padding: '5px 12px', borderRadius: '10px',
                            background: 'rgba(99,102,241,0.06)', color: 'var(--gx-accent)',
                            border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer',
                          }}>기구 일괄확인 ({mechReadyInTab}건)</button>
                        )}
                        {elecReadyInTab > 0 && (
                          <button onClick={() => handleBatchConfirm('ELEC')} style={{
                            fontSize: '11px', fontWeight: 600, padding: '5px 12px', borderRadius: '10px',
                            background: 'rgba(59,130,246,0.06)', color: '#3B82F6',
                            border: '1px solid rgba(59,130,246,0.2)', cursor: 'pointer',
                          }}>전장 일괄확인 ({elecReadyInTab}건)</button>
                        )}
                      </div>
                    </>
                  )}
                  {activeProcessTab === 'tm' && tmReadyInTab > 0 && (
                    <>
                      <div style={{ width: '1px', height: '28px', background: 'var(--gx-mist)' }} />
                      <button onClick={() => handleBatchConfirm('TM' as any)} style={{
                        fontSize: '11px', fontWeight: 600, padding: '5px 12px', borderRadius: '10px',
                        background: 'rgba(99,102,241,0.06)', color: 'var(--gx-accent)',
                        border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer',
                      }}>TM 일괄확인 ({tmReadyInTab}건)</button>
                    </>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>{perfData?.month ?? ''}</span>
                  <span style={{ fontSize: '9px', fontWeight: 600, padding: '2px 8px', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', color: 'var(--gx-warning)' }}>마감 전</span>
                </div>
              )}

              {isAdmin && (
                <div style={{ marginLeft: 'auto', position: 'relative' }}>
                  <button onClick={() => setSettingsOpen(!settingsOpen)} style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    border: '1px solid var(--gx-mist)', background: settingsOpen ? 'var(--gx-accent-soft)' : 'var(--gx-snow)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: settingsOpen ? 'var(--gx-accent)' : 'var(--gx-steel)', transition: 'all 0.15s',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <ConfirmSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
                </div>
              )}
            </div>

            {/* ─── 주간 뷰 ─── */}
            {activeView === 'weekly' && (
              <div style={{ background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '960px' }}>
                    <thead>
                      <tr style={{ background: 'var(--gx-cloud)' }}>
                        {['', 'O/N', '모델', 'S/N',
                          ...(activeProcessTab === 'mech_elec'
                            ? ['기구 (MECH)', '전장 (ELEC)']
                            : ['TM']),
                        ].map((h, i) => (
                          <th key={h + i} style={{
                            padding: '11px 14px', textAlign: 'left',
                            fontSize: '10px', fontWeight: 600, color: 'var(--gx-steel)',
                            letterSpacing: '0.5px', textTransform: 'uppercase',
                            whiteSpace: 'nowrap', borderBottom: '2px solid var(--gx-mist)',
                            width: i === 0 ? '32px' : 'auto',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    {filteredOrders.map(order => {
                      const isExpanded = expandedOrders.has(order.sales_order);

                      // O/N 전체 완료 여부 (3공정 모두 confirmed)
                      const allConfirmed = (['MECH', 'ELEC'] as const).every(pt => (order.confirms ?? []).some(c => c.process_type === pt))
                        && ((order.processes?.TM?.total ?? 0) === 0 || (order.confirms ?? []).some(c => c.process_type === 'TM'));

                      return (
                        <tbody key={order.sales_order}>
                          <tr
                            onClick={() => toggleExpand(order.sales_order)}
                            style={{
                              borderBottom: isExpanded ? 'none' : '1px solid var(--gx-cloud)',
                              cursor: 'pointer', transition: 'background 0.1s',
                              background: allConfirmed ? 'rgba(16,185,129,0.02)' : 'transparent',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--gx-snow)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = allConfirmed ? 'rgba(16,185,129,0.02)' : 'transparent'; }}
                          >
                            {/* 펼침 */}
                            <td style={{ padding: '12px 6px 12px 14px', width: '32px' }}>
                              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="var(--gx-steel)" strokeWidth="1.5"
                                style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                <path d="M5 3l4 4-4 4" />
                              </svg>
                            </td>
                            {/* O/N */}
                            <td style={{ padding: '12px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 700, color: 'var(--gx-charcoal)' }}>
                              {order.sales_order}
                              {allConfirmed && <span style={{ color: 'var(--gx-success)', marginLeft: '5px', fontSize: '12px' }}>&#10003;</span>}
                            </td>
                            {/* 모델 */}
                            <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--gx-charcoal)', fontSize: '12px', whiteSpace: 'nowrap' }}>{order.model}</td>
                            {/* S/N 요약 */}
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--gx-graphite)' }}>
                                {order.sn_summary}
                              </span>
                              <span style={{ fontSize: '10px', color: 'var(--gx-steel)', marginLeft: '5px' }}>({order.sn_count}대)</span>
                            </td>
                            {/* 기구·전장 탭일 때 */}
                            {activeProcessTab === 'mech_elec' && (
                              <>
                                <ProcessCell
                                  processType="MECH"
                                  processStatus={(order.processes?.MECH ?? { ready: 0, total: 0, confirmable: false })}
                                  confirms={order.confirms ?? []}
                                  partnerDisplay={(order.partner_info?.mech ?? '—')}
                                  mixed={(order.partner_info?.mixed ?? false)}
                                  onConfirm={() => handleConfirm(order.sales_order, 'MECH')}
                                  confirmPending={confirmMutation.isPending}
                                  enabled={isProcessEnabled('MECH')}
                                />
                                <ProcessCell
                                  processType="ELEC"
                                  processStatus={(order.processes?.ELEC ?? { ready: 0, total: 0, confirmable: false })}
                                  confirms={order.confirms ?? []}
                                  partnerDisplay={(order.partner_info?.elec ?? '—')}
                                  mixed={(order.partner_info?.mixed ?? false)}
                                  onConfirm={() => handleConfirm(order.sales_order, 'ELEC')}
                                  confirmPending={confirmMutation.isPending}
                                  enabled={isProcessEnabled('ELEC')}
                                />
                              </>
                            )}
                            {/* TM 탭일 때 */}
                            {activeProcessTab === 'tm' && (
                              <ProcessCell
                                processType="TM"
                                processStatus={(order.processes?.TM ?? { ready: 0, total: 0, confirmable: false })}
                                confirms={order.confirms ?? []}
                                partnerDisplay=""
                                mixed={false}
                                onConfirm={() => handleConfirm(order.sales_order, 'TM')}
                                confirmPending={confirmMutation.isPending}
                                enabled={isProcessEnabled('TM')}
                              />
                            )}
                          </tr>

                          {/* S/N 상세 */}
                          {isExpanded && (order.sns ?? []).map((sn, idx) => (
                            <tr key={sn.serial_number} style={{
                              background: 'var(--gx-snow)',
                              borderBottom: idx === (order.sns ?? []).length - 1 ? '2px solid var(--gx-mist)' : '1px solid var(--gx-cloud)',
                            }}>
                              <td />
                              <td style={{ padding: '8px 14px' }}>
                                <span style={{ fontSize: '10px', color: 'var(--gx-silver)', fontFamily: "'JetBrains Mono', monospace" }}>└</span>
                              </td>
                              <td style={{ padding: '8px 14px' }}>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600, color: 'var(--gx-graphite)' }}>{sn.serial_number}</span>
                              </td>
                              <td style={{ padding: '8px 14px', fontSize: '10px', color: 'var(--gx-steel)' }}>
                                기구 <strong>{sn.mech_partner}</strong> · 전장 <strong>{sn.elec_partner}</strong>
                              </td>
                              {/* 기구·전장 탭 */}
                              {activeProcessTab === 'mech_elec' && (
                                <>
                                  <td style={{ padding: '8px 14px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                      <MiniProgress value={sn.progress?.MECH?.pct ?? 0} total={sn.progress?.MECH?.total ?? 0} />
                                      {sn.checklist?.MECH?.completed_at && <span style={{ fontSize: '8.5px', color: 'var(--gx-silver)', fontFamily: "'JetBrains Mono', monospace" }}>완료 {sn.checklist.MECH.completed_at.slice(5, 10)}</span>}
                                    </div>
                                  </td>
                                  <td style={{ padding: '8px 14px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                      <MiniProgress value={sn.progress?.ELEC?.pct ?? 0} total={sn.progress?.ELEC?.total ?? 0} />
                                      {sn.checklist?.ELEC?.completed_at && <span style={{ fontSize: '8.5px', color: 'var(--gx-silver)', fontFamily: "'JetBrains Mono', monospace" }}>완료 {sn.checklist.ELEC.completed_at.slice(5, 10)}</span>}
                                    </div>
                                  </td>
                                </>
                              )}
                              {/* TM 탭 */}
                              {activeProcessTab === 'tm' && (
                                <td style={{ padding: '8px 14px' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                    <MiniProgress value={sn.progress?.TM?.pct ?? 0} total={sn.progress?.TM?.total ?? 0} />
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      );
                    })}
                  </table>
                </div>
              </div>
            )}

            {/* ─── 월마감 뷰 ─── */}
            {activeView === 'monthly' && monthlyData && (
              <div style={{ background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px 8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)', marginBottom: '3px' }}>{monthlyData.month} — 주차별 실적 집계</div>
                  <div style={{ fontSize: '11px', color: 'var(--gx-steel)' }}>공정별 완료 + 실적확인 건수 · plan.production_confirm 기준</div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--gx-cloud)' }}>
                        <th style={{ ...thStyle, textAlign: 'left' }}>주차</th>
                        <th colSpan={2} style={{ ...thStyle, borderBottom: '2px solid var(--gx-mist)', background: 'rgba(99,102,241,0.04)' }}>기구 (MECH)</th>
                        <th colSpan={2} style={{ ...thStyle, borderBottom: '2px solid var(--gx-mist)', background: 'rgba(59,130,246,0.04)' }}>전장 (ELEC)</th>
                        <th colSpan={2} style={{ ...thStyle, borderBottom: '2px solid var(--gx-mist)', background: 'rgba(139,92,246,0.04)' }}>TM</th>
                      </tr>
                      <tr style={{ background: 'var(--gx-cloud)' }}>
                        <th />
                        <th style={subThStyle}>완료</th>
                        <th style={subThStyle}>확인</th>
                        <th style={subThStyle}>완료</th>
                        <th style={subThStyle}>확인</th>
                        <th style={subThStyle}>완료</th>
                        <th style={subThStyle}>확인</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyData.weeks.map(row => {
                        const isCurrent = perfData?.week === row.week;
                        return (
                          <tr key={row.week} style={{
                            borderBottom: '1px solid var(--gx-cloud)',
                            background: isCurrent ? 'rgba(99,102,241,0.02)' : 'transparent',
                          }}>
                            <td style={{ padding: '13px 20px', fontWeight: 600, color: isCurrent ? 'var(--gx-accent)' : 'var(--gx-charcoal)', fontSize: '13px' }}>
                              {row.week}
                              {isCurrent && <span style={{ fontSize: '8px', fontWeight: 600, padding: '1px 5px', borderRadius: '5px', background: 'rgba(99,102,241,0.08)', color: 'var(--gx-accent)', marginLeft: '5px' }}>현재</span>}
                            </td>
                            <MonthlyCell value={row.mech?.completed ?? 0} max={0} />
                            <MonthlyCell value={row.mech?.confirmed ?? 0} max={row.mech?.completed ?? 0} isConfirm />
                            <MonthlyCell value={row.elec?.completed ?? 0} max={0} />
                            <MonthlyCell value={row.elec?.confirmed ?? 0} max={row.elec?.completed ?? 0} isConfirm />
                            <MonthlyCell value={row.tm?.completed ?? 0} max={0} />
                            <MonthlyCell value={row.tm?.confirmed ?? 0} max={row.tm?.completed ?? 0} isConfirm />
                          </tr>
                        );
                      })}
                      {/* 합계 */}
                      <tr style={{ background: 'var(--gx-cloud)', borderTop: '2px solid var(--gx-mist)' }}>
                        <td style={{ padding: '13px 20px', fontWeight: 700, color: 'var(--gx-charcoal)', fontSize: '13px' }}>합계</td>
                        <td style={{ ...numCellStyle, fontWeight: 700, color: 'var(--gx-success)' }}>{monthlyData?.totals?.mech?.completed ?? 0}</td>
                        <td style={{ ...numCellStyle, fontWeight: 700, color: 'var(--gx-accent)' }}>{monthlyData?.totals?.mech?.confirmed ?? 0}</td>
                        <td style={{ ...numCellStyle, fontWeight: 700, color: 'var(--gx-success)' }}>{monthlyData?.totals?.elec?.completed ?? 0}</td>
                        <td style={{ ...numCellStyle, fontWeight: 700, color: 'var(--gx-accent)' }}>{monthlyData?.totals?.elec?.confirmed ?? 0}</td>
                        <td style={{ ...numCellStyle, fontWeight: 700, color: 'var(--gx-success)' }}>{monthlyData?.totals?.tm?.completed ?? 0}</td>
                        <td style={{ ...numCellStyle, fontWeight: 700, color: 'var(--gx-accent)' }}>{monthlyData?.totals?.tm?.confirmed ?? 0}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

/* ─── 스타일 상수 ───────────────────────────────────── */
const thStyle: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'center',
  fontSize: '10px', fontWeight: 600, color: 'var(--gx-steel)',
  letterSpacing: '0.5px', textTransform: 'uppercase',
  borderBottom: '2px solid var(--gx-mist)',
};
const subThStyle: React.CSSProperties = {
  padding: '6px 16px', textAlign: 'center',
  fontSize: '9px', fontWeight: 600, color: 'var(--gx-silver)',
  letterSpacing: '0.3px', borderBottom: '1px solid var(--gx-mist)',
};
const numCellStyle: React.CSSProperties = {
  padding: '13px 16px', textAlign: 'center',
  fontFamily: "'JetBrains Mono', monospace", fontSize: '13px',
  fontWeight: 600, color: 'var(--gx-charcoal)',
};

function MonthlyCell({ value, max, isConfirm }: { value: number; max: number; isConfirm?: boolean }) {
  const allDone = max > 0 && value === max;
  return (
    <td style={{
      ...numCellStyle,
      color: value === 0 ? 'var(--gx-silver)' : isConfirm ? (allDone ? 'var(--gx-success)' : 'var(--gx-accent)') : (allDone ? 'var(--gx-success)' : 'var(--gx-charcoal)'),
    }}>
      {value}
      {isConfirm && allDone && max > 0 && <span style={{ color: 'var(--gx-success)', marginLeft: '2px', fontSize: '10px' }}>&#10003;</span>}
    </td>
  );
}
