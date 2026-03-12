// src/pages/production/ProductionPerformancePage.tsx
// 생산실적 — O/N 단위 주간·월간 실적 관리
// 카톡→PPS→카톡 프로세스 대체 → OPS progress 100% → 공정별 실적확인 → 재무회계 근거
// 실적확인 단위: O/N × 공정(MECH/ELEC/TM) 개별 확인
// DB: plan.production_confirm (Core DB)

import { useState } from 'react';
import Layout from '@/components/layout/Layout';

/* ─── 타입 ──────────────────────────────────────────── */
type ConfirmStatus = 'confirmed' | 'ready' | 'in-progress';

interface SnDetail {
  sn: string;
  mechPartner: string;
  elecPartner: string;
  mechProgress: number;
  elecProgress: number;
  tmProgress: number;     // -1 = N/A (non-GAIA)
  mechEnd: string | null;
  elecEnd: string | null;
  tmEnd: string | null;
}

interface ProcessConfirm {
  status: ConfirmStatus;
  confirmedAt: string | null;
  confirmedBy: string | null;
}

interface OrderGroup {
  on: string;
  model: string;
  customer: string;
  line: string;
  snList: SnDetail[];
  mechConfirm: ProcessConfirm;
  elecConfirm: ProcessConfirm;
  tmConfirm: ProcessConfirm;   // status='confirmed' if all N/A
}

/* ─── 주차 ──────────────────────────────────────────── */
const WEEKS = [
  { label: 'W10', range: '03.02 ~ 03.08' },
  { label: 'W11', range: '03.09 ~ 03.15', current: true },
  { label: 'W12', range: '03.16 ~ 03.22' },
  { label: 'W13', range: '03.23 ~ 03.29' },
];

/* ─── 샘플 데이터 ────────────────────────────────────── */
const SAMPLE_ORDERS: OrderGroup[] = [
  {
    on: '6238', model: 'GAIA-I DUAL', customer: 'MICRON', line: 'JP(F15)',
    mechConfirm: { status: 'confirmed', confirmedAt: '03-10 14:22', confirmedBy: '김생관' },
    elecConfirm: { status: 'confirmed', confirmedAt: '03-11 09:15', confirmedBy: '김생관' },
    tmConfirm: { status: 'in-progress', confirmedAt: null, confirmedBy: null },
    snList: [
      { sn: 'GBWS-6627', mechPartner: 'BAT', elecPartner: 'P&S', mechProgress: 100, elecProgress: 100, tmProgress: 100, mechEnd: '02-28', elecEnd: '03-05', tmEnd: '03-08' },
      { sn: 'GBWS-6628', mechPartner: 'BAT', elecPartner: 'P&S', mechProgress: 100, elecProgress: 100, tmProgress: 85, mechEnd: '03-01', elecEnd: '03-06', tmEnd: null },
      { sn: 'GBWS-6629', mechPartner: 'BAT', elecPartner: 'P&S', mechProgress: 100, elecProgress: 100, tmProgress: 60, mechEnd: '03-02', elecEnd: '03-07', tmEnd: null },
    ],
  },
  {
    on: '6312', model: 'GAIA-I DUAL', customer: 'MICRON', line: 'JP(F15)',
    mechConfirm: { status: 'confirmed', confirmedAt: '03-09 10:30', confirmedBy: '박생관' },
    elecConfirm: { status: 'confirmed', confirmedAt: '03-10 11:20', confirmedBy: '박생관' },
    tmConfirm: { status: 'confirmed', confirmedAt: '03-11 16:40', confirmedBy: '박생관' },
    snList: [
      { sn: 'GBWS-6620', mechPartner: 'BAT', elecPartner: 'TMS(E)', mechProgress: 100, elecProgress: 100, tmProgress: 100, mechEnd: '02-25', elecEnd: '03-02', tmEnd: '03-06' },
    ],
  },
  {
    on: '6401', model: 'GAIA-I DUAL', customer: 'SEC', line: '15L',
    mechConfirm: { status: 'confirmed', confirmedAt: '03-11 14:05', confirmedBy: '김생관' },
    elecConfirm: { status: 'ready', confirmedAt: null, confirmedBy: null },
    tmConfirm: { status: 'in-progress', confirmedAt: null, confirmedBy: null },
    snList: [
      { sn: 'GBWS-6635', mechPartner: 'C&A', elecPartner: 'TMS(E)', mechProgress: 100, elecProgress: 100, tmProgress: 45, mechEnd: '03-05', elecEnd: '03-09', tmEnd: null },
      { sn: 'GBWS-6636', mechPartner: 'C&A', elecPartner: 'TMS(E)', mechProgress: 100, elecProgress: 100, tmProgress: 30, mechEnd: '03-06', elecEnd: '03-10', tmEnd: null },
    ],
  },
  {
    on: '6405', model: 'GAIA-P DUAL', customer: 'SAMSUNG', line: 'JP(F15)',
    mechConfirm: { status: 'in-progress', confirmedAt: null, confirmedBy: null },
    elecConfirm: { status: 'in-progress', confirmedAt: null, confirmedBy: null },
    tmConfirm: { status: 'in-progress', confirmedAt: null, confirmedBy: null },
    snList: [
      { sn: 'GBWS-6640', mechPartner: 'FNI', elecPartner: 'P&S', mechProgress: 100, elecProgress: 65, tmProgress: 0, mechEnd: '03-07', elecEnd: null, tmEnd: null },
      { sn: 'GBWS-6641', mechPartner: 'FNI', elecPartner: 'P&S', mechProgress: 92, elecProgress: 0, tmProgress: 0, mechEnd: null, elecEnd: null, tmEnd: null },
      { sn: 'GBWS-6642', mechPartner: 'FNI', elecPartner: 'P&S', mechProgress: 78, elecProgress: 0, tmProgress: 0, mechEnd: null, elecEnd: null, tmEnd: null },
      { sn: 'GBWS-6643', mechPartner: 'FNI', elecPartner: 'P&S', mechProgress: 50, elecProgress: 0, tmProgress: 0, mechEnd: null, elecEnd: null, tmEnd: null },
      { sn: 'GBWS-6644', mechPartner: 'FNI', elecPartner: 'C&A', mechProgress: 30, elecProgress: 0, tmProgress: 0, mechEnd: null, elecEnd: null, tmEnd: null },
    ],
  },
  {
    on: '6410', model: 'O3 Destructor', customer: 'SEC', line: '15L',
    mechConfirm: { status: 'ready', confirmedAt: null, confirmedBy: null },
    elecConfirm: { status: 'in-progress', confirmedAt: null, confirmedBy: null },
    tmConfirm: { status: 'confirmed', confirmedAt: null, confirmedBy: null }, // N/A → auto confirmed
    snList: [
      { sn: 'GBWS-6650', mechPartner: 'BAT', elecPartner: 'TMS(E)', mechProgress: 100, elecProgress: 100, tmProgress: -1, mechEnd: '03-04', elecEnd: '03-08', tmEnd: null },
      { sn: 'GBWS-6651', mechPartner: 'BAT', elecPartner: 'TMS(E)', mechProgress: 100, elecProgress: 55, tmProgress: -1, mechEnd: '03-05', elecEnd: null, tmEnd: null },
    ],
  },
  {
    on: '6415', model: 'SWS-I', customer: 'HYNIX', line: 'JP(F15)',
    mechConfirm: { status: 'in-progress', confirmedAt: null, confirmedBy: null },
    elecConfirm: { status: 'in-progress', confirmedAt: null, confirmedBy: null },
    tmConfirm: { status: 'confirmed', confirmedAt: null, confirmedBy: null }, // N/A
    snList: [
      { sn: 'GBWS-6660', mechPartner: 'FNI', elecPartner: 'C&A', mechProgress: 45, elecProgress: 0, tmProgress: -1, mechEnd: null, elecEnd: null, tmEnd: null },
    ],
  },
];

/* ─── 월마감 샘플 ────────────────────────────────────── */
const MONTHLY_SUMMARY = [
  { week: 'W10', onCount: 8, mech: { done: 8, confirmed: 8 }, elec: { done: 6, confirmed: 6 }, tm: { done: 4, confirmed: 4 } },
  { week: 'W11', onCount: 6, mech: { done: 4, confirmed: 3 }, elec: { done: 2, confirmed: 2 }, tm: { done: 1, confirmed: 1 } },
  { week: 'W12', onCount: 5, mech: { done: 0, confirmed: 0 }, elec: { done: 0, confirmed: 0 }, tm: { done: 0, confirmed: 0 } },
  { week: 'W13', onCount: 4, mech: { done: 0, confirmed: 0 }, elec: { done: 0, confirmed: 0 }, tm: { done: 0, confirmed: 0 } },
];

/* ─── 유틸 ──────────────────────────────────────────── */
function countDone(snList: SnDetail[], field: 'mechProgress' | 'elecProgress' | 'tmProgress'): { done: number; total: number; na: boolean } {
  const applicable = snList.filter(s => s[field] >= 0);
  if (applicable.length === 0) return { done: 0, total: 0, na: true };
  const done = applicable.filter(s => s[field] >= 100).length;
  return { done, total: applicable.length, na: false };
}

function summarizeSNs(snList: SnDetail[]): string {
  if (snList.length === 0) return '-';
  if (snList.length <= 2) return snList.map(s => s.sn).join(', ');
  const prefix = snList[0].sn.replace(/\d+$/, '');
  const nums = snList.map(s => { const m = s.sn.match(/(\d+)$/); return m ? parseInt(m[1], 10) : null; });
  if (nums.every(n => n !== null)) {
    const sorted = (nums as number[]).sort((a, b) => a - b);
    if (sorted.every((n, i) => i === 0 || n === sorted[i - 1] + 1)) {
      return `${prefix}${sorted[0]}~${sorted[sorted.length - 1]}`;
    }
  }
  return `${snList[0].sn} 외 ${snList.length - 1}건`;
}

function partnerInfo(snList: SnDetail[], field: 'mechPartner' | 'elecPartner'): { mixed: boolean; display: string } {
  const partners = [...new Set(snList.map(s => s[field]))];
  if (partners.length === 1) return { mixed: false, display: partners[0] };
  return { mixed: true, display: partners.join(' / ') };
}

/* ─── MiniProgress ─────────────────────────────────── */
function MiniProgress({ value }: { value: number }) {
  if (value < 0) return <span style={{ fontSize: '10px', color: 'var(--gx-silver)', fontStyle: 'italic' }}>N/A</span>;
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

/* ─── ProcessCell — 공정별 인라인 확인 셀 ──────────── */
function ProcessCell({ info, confirm, partnerDisplay, mixed }: {
  info: { done: number; total: number; na: boolean };
  confirm: ProcessConfirm;
  partnerDisplay: string;
  mixed: boolean;
}) {
  if (info.na) {
    return (
      <td style={{ padding: '12px 14px' }}>
        <span style={{ fontSize: '11px', color: 'var(--gx-silver)', fontStyle: 'italic' }}>N/A</span>
      </td>
    );
  }

  const allDone = info.done === info.total;

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
            {info.done}/{info.total}
          </span>

          {/* 확인 버튼/상태 */}
          {confirm.status === 'confirmed' ? (
            <span style={{
              fontSize: '9px', fontWeight: 600, padding: '2px 8px', borderRadius: '8px',
              background: 'rgba(16,185,129,0.08)', color: 'var(--gx-success)',
              display: 'inline-flex', alignItems: 'center', gap: '3px',
            }}>
              &#10003; 확인
            </span>
          ) : confirm.status === 'ready' ? (
            <button style={{
              fontSize: '9px', fontWeight: 600, padding: '3px 10px', borderRadius: '8px',
              background: 'var(--gx-accent)', color: '#fff',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(99,102,241,0.3)',
              transition: 'all 0.15s',
            }}>
              실적확인
            </button>
          ) : null}
        </div>

        {/* 협력사 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span style={{ fontSize: '10px', color: 'var(--gx-steel)' }}>{partnerDisplay}</span>
          {mixed && (
            <span style={{
              fontSize: '7.5px', fontWeight: 700, padding: '1px 4px', borderRadius: '3px',
              background: 'rgba(245,158,11,0.1)', color: 'var(--gx-warning)',
            }}>혼재</span>
          )}
        </div>

        {/* 확인 이력 */}
        {confirm.status === 'confirmed' && confirm.confirmedAt && (
          <span style={{ fontSize: '8.5px', color: 'var(--gx-silver)', fontFamily: "'JetBrains Mono', monospace" }}>
            {confirm.confirmedBy} · {confirm.confirmedAt}
          </span>
        )}
      </div>
    </td>
  );
}

/* ─── PrepareBanner ─────────────────────────────────── */
function PrepareBanner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '14px 20px', marginBottom: '20px',
      background: 'var(--gx-warning-bg)', borderRadius: 'var(--radius-gx-lg)',
      border: '1px solid rgba(245, 158, 11, 0.2)',
    }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gx-warning)', flexShrink: 0 }} />
      <div style={{ fontSize: '13px', color: 'var(--gx-graphite)' }}>
        <strong>API 연동 준비 중</strong> · 아래 데이터는 샘플입니다. OPS 실시간 데이터 연동 후 표시됩니다.
      </div>
      <div style={{
        marginLeft: 'auto', padding: '4px 12px', borderRadius: 'var(--radius-gx-sm)',
        fontSize: '11px', fontWeight: 600, color: 'var(--gx-warning)', background: 'rgba(245, 158, 11, 0.12)',
      }}>Phase 3</div>
    </div>
  );
}

/* ─── 메인 ──────────────────────────────────────────── */
export default function ProductionPerformancePage() {
  const [activeWeek, setActiveWeek] = useState('W11');
  const [activeView, setActiveView] = useState<'weekly' | 'monthly'>('weekly');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | 'done' | 'pending'>('all');

  const toggleExpand = (on: string) => {
    setExpandedOrders(prev => { const n = new Set(prev); if (n.has(on)) n.delete(on); else n.add(on); return n; });
  };

  // KPI 산출
  const totalON = SAMPLE_ORDERS.length;
  const totalSN = SAMPLE_ORDERS.reduce((s, o) => s + o.snList.length, 0);
  const mechConfirmed = SAMPLE_ORDERS.filter(o => o.mechConfirm.status === 'confirmed').length;
  const elecConfirmed = SAMPLE_ORDERS.filter(o => o.elecConfirm.status === 'confirmed').length;
  const tmApplicable = SAMPLE_ORDERS.filter(o => o.snList.some(s => s.tmProgress >= 0));
  const tmConfirmed = tmApplicable.filter(o => o.tmConfirm.status === 'confirmed').length;
  const mechReady = SAMPLE_ORDERS.filter(o => o.mechConfirm.status === 'ready').length;
  const elecReady = SAMPLE_ORDERS.filter(o => o.elecConfirm.status === 'ready').length;

  // 필터
  const filteredOrders = SAMPLE_ORDERS.filter(o => {
    if (statusFilter === 'done') return o.mechConfirm.status === 'confirmed' && o.elecConfirm.status === 'confirmed' && o.tmConfirm.status === 'confirmed';
    if (statusFilter === 'pending') return o.mechConfirm.status !== 'confirmed' || o.elecConfirm.status !== 'confirmed' || o.tmConfirm.status !== 'confirmed';
    return true;
  });

  return (
    <Layout title="생산실적">
      <div style={{ padding: '28px 32px', maxWidth: '1600px' }}>
        <PrepareBanner />

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

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '20px' }}>
          {[
            { label: '주간 O/N', value: `${totalON}`, sub: `S/N ${totalSN}대`, color: 'var(--gx-info)' },
            { label: '기구 확인', value: `${mechConfirmed}/${totalON}`, sub: mechReady > 0 ? `${mechReady}건 확인 가능` : '대기', color: 'var(--gx-success)' },
            { label: '전장 확인', value: `${elecConfirmed}/${totalON}`, sub: elecReady > 0 ? `${elecReady}건 확인 가능` : '대기', color: '#3B82F6' },
            { label: 'TM 확인', value: `${tmConfirmed}/${tmApplicable.length}`, sub: `GAIA ${tmApplicable.length}건`, color: 'var(--gx-accent)' },
            { label: '월간 누적', value: '18', sub: '3월 공정 확인', color: 'var(--gx-warning)' },
          ].map(k => (
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
                {WEEKS.map(w => (
                  <button key={w.label} onClick={() => setActiveWeek(w.label)} style={{
                    padding: '5px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 500,
                    border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
                    ...(activeWeek === w.label
                      ? { background: 'var(--gx-accent)', color: '#fff', borderColor: 'var(--gx-accent)' }
                      : { background: 'transparent', color: 'var(--gx-slate)', borderColor: 'var(--gx-mist)' }),
                  }}>
                    {w.label}
                    <span style={{ fontSize: '9.5px', marginLeft: '4px', opacity: 0.7 }}>{w.range}</span>
                    {w.current && activeWeek !== w.label && (
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--gx-success)', display: 'inline-block', marginLeft: '3px', verticalAlign: 'middle' }} />
                    )}
                  </button>
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

              {/* 일괄 확인 */}
              {(mechReady > 0 || elecReady > 0) && (
                <>
                  <div style={{ width: '1px', height: '28px', background: 'var(--gx-mist)' }} />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {mechReady > 0 && (
                      <button style={{
                        fontSize: '11px', fontWeight: 600, padding: '5px 12px', borderRadius: '10px',
                        background: 'rgba(99,102,241,0.06)', color: 'var(--gx-accent)',
                        border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer',
                      }}>기구 일괄확인 ({mechReady}건)</button>
                    )}
                    {elecReady > 0 && (
                      <button style={{
                        fontSize: '11px', fontWeight: 600, padding: '5px 12px', borderRadius: '10px',
                        background: 'rgba(59,130,246,0.06)', color: '#3B82F6',
                        border: '1px solid rgba(59,130,246,0.2)', cursor: 'pointer',
                      }}>전장 일괄확인 ({elecReady}건)</button>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>2026년 3월</span>
              <span style={{ fontSize: '9px', fontWeight: 600, padding: '2px 8px', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', color: 'var(--gx-warning)' }}>마감 전</span>
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
                    {['', 'O/N', '모델', '고객사', 'S/N', '기구 (MECH)', '전장 (ELEC)', 'TM'].map((h, i) => (
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
                  const isExpanded = expandedOrders.has(order.on);
                  const mechInfo = countDone(order.snList, 'mechProgress');
                  const elecInfo = countDone(order.snList, 'elecProgress');
                  const tmInfo = countDone(order.snList, 'tmProgress');
                  const mechP = partnerInfo(order.snList, 'mechPartner');
                  const elecP = partnerInfo(order.snList, 'elecPartner');

                  // O/N 전체 완료 여부 (3공정 모두 confirmed)
                  const allConfirmed = order.mechConfirm.status === 'confirmed' && order.elecConfirm.status === 'confirmed' && order.tmConfirm.status === 'confirmed';

                  return (
                    <tbody key={order.on}>
                      <tr
                        onClick={() => toggleExpand(order.on)}
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
                          {order.on}
                          {allConfirmed && <span style={{ color: 'var(--gx-success)', marginLeft: '5px', fontSize: '12px' }}>&#10003;</span>}
                        </td>
                        {/* 모델 */}
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--gx-charcoal)', fontSize: '12px', whiteSpace: 'nowrap' }}>{order.model}</td>
                        {/* 고객사 */}
                        <td style={{ padding: '12px 14px', color: 'var(--gx-graphite)', fontSize: '12px' }}>{order.customer}</td>
                        {/* S/N 요약 */}
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--gx-graphite)' }}>
                            {summarizeSNs(order.snList)}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--gx-steel)', marginLeft: '5px' }}>({order.snList.length}대)</span>
                        </td>
                        {/* 기구 */}
                        <ProcessCell info={mechInfo} confirm={order.mechConfirm} partnerDisplay={mechP.display} mixed={mechP.mixed} />
                        {/* 전장 */}
                        <ProcessCell info={elecInfo} confirm={order.elecConfirm} partnerDisplay={elecP.display} mixed={elecP.mixed} />
                        {/* TM */}
                        <ProcessCell info={tmInfo} confirm={order.tmConfirm} partnerDisplay="" mixed={false} />
                      </tr>

                      {/* S/N 상세 */}
                      {isExpanded && order.snList.map((sn, idx) => (
                        <tr key={sn.sn} style={{
                          background: 'var(--gx-snow)',
                          borderBottom: idx === order.snList.length - 1 ? '2px solid var(--gx-mist)' : '1px solid var(--gx-cloud)',
                        }}>
                          <td />
                          <td style={{ padding: '8px 14px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--gx-silver)', fontFamily: "'JetBrains Mono', monospace" }}>└</span>
                          </td>
                          <td colSpan={2} style={{ padding: '8px 14px' }}>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600, color: 'var(--gx-graphite)' }}>{sn.sn}</span>
                          </td>
                          <td style={{ padding: '8px 14px', fontSize: '10px', color: 'var(--gx-steel)' }}>
                            기구 <strong>{sn.mechPartner}</strong> · 전장 <strong>{sn.elecPartner}</strong>
                          </td>
                          {/* MECH progress */}
                          <td style={{ padding: '8px 14px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                              <MiniProgress value={sn.mechProgress} />
                              {sn.mechEnd && <span style={{ fontSize: '8.5px', color: 'var(--gx-silver)', fontFamily: "'JetBrains Mono', monospace" }}>완료 {sn.mechEnd}</span>}
                            </div>
                          </td>
                          {/* ELEC progress */}
                          <td style={{ padding: '8px 14px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                              <MiniProgress value={sn.elecProgress} />
                              {sn.elecEnd && <span style={{ fontSize: '8.5px', color: 'var(--gx-silver)', fontFamily: "'JetBrains Mono', monospace" }}>완료 {sn.elecEnd}</span>}
                            </div>
                          </td>
                          {/* TM progress */}
                          <td style={{ padding: '8px 14px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                              <MiniProgress value={sn.tmProgress} />
                              {sn.tmEnd && <span style={{ fontSize: '8.5px', color: 'var(--gx-silver)', fontFamily: "'JetBrains Mono', monospace" }}>완료 {sn.tmEnd}</span>}
                            </div>
                          </td>
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
        {activeView === 'monthly' && (
          <div style={{ background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px 8px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)', marginBottom: '3px' }}>2026년 3월 — 주차별 실적 집계</div>
              <div style={{ fontSize: '11px', color: 'var(--gx-steel)' }}>공정별 완료 + 실적확인 건수 · plan.production_confirm 기준</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--gx-cloud)' }}>
                    <th style={{ ...thStyle, textAlign: 'left' }}>주차</th>
                    <th style={thStyle}>대상 O/N</th>
                    <th colSpan={2} style={{ ...thStyle, borderBottom: '2px solid var(--gx-mist)', background: 'rgba(99,102,241,0.04)' }}>기구 (MECH)</th>
                    <th colSpan={2} style={{ ...thStyle, borderBottom: '2px solid var(--gx-mist)', background: 'rgba(59,130,246,0.04)' }}>전장 (ELEC)</th>
                    <th colSpan={2} style={{ ...thStyle, borderBottom: '2px solid var(--gx-mist)', background: 'rgba(139,92,246,0.04)' }}>TM</th>
                  </tr>
                  <tr style={{ background: 'var(--gx-cloud)' }}>
                    <th colSpan={2} />
                    <th style={subThStyle}>완료</th>
                    <th style={subThStyle}>확인</th>
                    <th style={subThStyle}>완료</th>
                    <th style={subThStyle}>확인</th>
                    <th style={subThStyle}>완료</th>
                    <th style={subThStyle}>확인</th>
                  </tr>
                </thead>
                <tbody>
                  {MONTHLY_SUMMARY.map(row => {
                    const isCurrent = row.week === 'W11';
                    return (
                      <tr key={row.week} style={{
                        borderBottom: '1px solid var(--gx-cloud)',
                        background: isCurrent ? 'rgba(99,102,241,0.02)' : 'transparent',
                      }}>
                        <td style={{ padding: '13px 20px', fontWeight: 600, color: isCurrent ? 'var(--gx-accent)' : 'var(--gx-charcoal)', fontSize: '13px' }}>
                          {row.week}
                          {isCurrent && <span style={{ fontSize: '8px', fontWeight: 600, padding: '1px 5px', borderRadius: '5px', background: 'rgba(99,102,241,0.08)', color: 'var(--gx-accent)', marginLeft: '5px' }}>현재</span>}
                        </td>
                        <td style={{ ...numCellStyle }}>{row.onCount}</td>
                        <MonthlyCell value={row.mech.done} max={row.onCount} />
                        <MonthlyCell value={row.mech.confirmed} max={row.mech.done} isConfirm />
                        <MonthlyCell value={row.elec.done} max={row.onCount} />
                        <MonthlyCell value={row.elec.confirmed} max={row.elec.done} isConfirm />
                        <MonthlyCell value={row.tm.done} max={row.onCount} />
                        <MonthlyCell value={row.tm.confirmed} max={row.tm.done} isConfirm />
                      </tr>
                    );
                  })}
                  {/* 합계 */}
                  <tr style={{ background: 'var(--gx-cloud)', borderTop: '2px solid var(--gx-mist)' }}>
                    <td style={{ padding: '13px 20px', fontWeight: 700, color: 'var(--gx-charcoal)', fontSize: '13px' }}>합계</td>
                    <td style={{ ...numCellStyle, fontWeight: 700 }}>{MONTHLY_SUMMARY.reduce((s, r) => s + r.onCount, 0)}</td>
                    <td style={{ ...numCellStyle, fontWeight: 700, color: 'var(--gx-success)' }}>{MONTHLY_SUMMARY.reduce((s, r) => s + r.mech.done, 0)}</td>
                    <td style={{ ...numCellStyle, fontWeight: 700, color: 'var(--gx-accent)' }}>{MONTHLY_SUMMARY.reduce((s, r) => s + r.mech.confirmed, 0)}</td>
                    <td style={{ ...numCellStyle, fontWeight: 700, color: 'var(--gx-success)' }}>{MONTHLY_SUMMARY.reduce((s, r) => s + r.elec.done, 0)}</td>
                    <td style={{ ...numCellStyle, fontWeight: 700, color: 'var(--gx-accent)' }}>{MONTHLY_SUMMARY.reduce((s, r) => s + r.elec.confirmed, 0)}</td>
                    <td style={{ ...numCellStyle, fontWeight: 700, color: 'var(--gx-success)' }}>{MONTHLY_SUMMARY.reduce((s, r) => s + r.tm.done, 0)}</td>
                    <td style={{ ...numCellStyle, fontWeight: 700, color: 'var(--gx-accent)' }}>{MONTHLY_SUMMARY.reduce((s, r) => s + r.tm.confirmed, 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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
