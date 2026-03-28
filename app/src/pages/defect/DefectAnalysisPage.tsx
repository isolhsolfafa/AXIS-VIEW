// src/pages/defect/DefectAnalysisPage.tsx
// 불량 분석 — API 연동 준비 중 (샘플 데이터)

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';

/* ─── Sample Data ─── */
const SAMPLE_KPI = [
  { label: '총 불량 건수', value: 97, unit: '건', variant: 'danger' as const, sub: '가압검사 불량 기준', alert: true },
  { label: '총 검사 CH수', value: 435, unit: 'CH', variant: 'info' as const, sub: '2026년 누적 검사', alert: false },
  { label: '평균 불량률', value: 22.3, unit: '%', variant: 'warning' as const, sub: '불량건수 / 검사CH수', alert: true },
  { label: '주요 외주사', value: 3, unit: '개사', variant: 'primary' as const, sub: '불량 데이터 보유 외주사', alert: false },
];

const KPI_ICONS: Record<string, React.ReactNode> = {
  danger: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 6.75v3.375M9 13.5h.008M3.818 15.75h10.364c1.118 0 1.811-1.211 1.247-2.182L10.247 3.818a1.431 1.431 0 00-2.494 0L2.571 13.568c-.564.971.129 2.182 1.247 2.182z"/>
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 13.5l4.5-4.5 3 3 4.5-6"/>
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="9" r="6.75"/><path d="M9 5.25v7.5M5.25 9h7.5"/>
    </svg>
  ),
  primary: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 15.75V3.375A1.125 1.125 0 014.125 2.25h9.75A1.125 1.125 0 0115 3.375V15.75M3 15.75h12M6.75 5.625h1.125M6.75 8.25h1.125M10.125 5.625h1.125M10.125 8.25h1.125"/>
    </svg>
  ),
};

const ICON_BG: Record<string, { bg: string; color: string }> = {
  danger: { bg: 'var(--gx-danger-bg)', color: 'var(--gx-danger)' },
  info: { bg: 'var(--gx-info-bg)', color: 'var(--gx-info)' },
  warning: { bg: 'var(--gx-warning-bg)', color: 'var(--gx-warning)' },
  primary: { bg: 'var(--gx-accent-soft)', color: 'var(--gx-accent)' },
};

const DONUT_PARTS = [
  { name: 'BULKHEAD UNION', count: 12, pct: 15.4, color: '#6366F1' },
  { name: 'UNION ELBOW', count: 11, pct: 14.1, color: '#3B82F6' },
  { name: 'MALE CONNECTOR', count: 9, pct: 11.5, color: '#10B981' },
  { name: 'UNION TEE', count: 7, pct: 8.97, color: '#F59E0B' },
  { name: 'ADJUSTABLE ELBOW', count: 5, pct: 6.41, color: '#8B5CF6' },
  { name: 'MALE ELBOW', count: 4, pct: 5.13, color: '#EC4899' },
  { name: '기타 (PUMP NUT, CLAMP 등)', count: 49, pct: 38.5, color: '#94A3B8' },
];

const RANKING_DATA = [
  { part: 'BULKHEAD UNION', meta: '가압검사 · 주요 불량 부품', count: 12, rank: 'top1' as const },
  { part: 'UNION ELBOW', meta: '가압검사 · 연결부 불량', count: 11, rank: 'top2' as const },
  { part: 'MALE CONNECTOR', meta: '가압검사 · 커넥터류', count: 9, rank: 'top3' as const },
  { part: 'UNION TEE', meta: '가압검사', count: 7, rank: 'rest' as const },
  { part: 'ADJUSTABLE ELBOW', meta: '가압검사', count: 5, rank: 'rest' as const },
  { part: 'MALE ELBOW', meta: '가압검사', count: 4, rank: 'rest' as const },
];

const RANK_STYLE: Record<string, { bg: string; color: string; barColor: string }> = {
  top1: { bg: 'var(--gx-danger-bg)', color: 'var(--gx-danger)', barColor: 'var(--gx-danger)' },
  top2: { bg: 'var(--gx-warning-bg)', color: 'var(--gx-warning)', barColor: 'var(--gx-warning)' },
  top3: { bg: 'var(--gx-info-bg)', color: 'var(--gx-info)', barColor: 'var(--gx-info)' },
  rest: { bg: 'var(--gx-cloud)', color: 'var(--gx-steel)', barColor: 'var(--gx-steel)' },
};

const TREND_LINES = [
  { name: 'BULKHEAD UNION', color: '#EF4444', points: '177,20 410,110' as const, dots: [{ x: 177, y: 20 }, { x: 410, y: 110 }] },
  { name: 'SPEED CONTROLLER', color: '#14B8A6', points: '177,38 410,120' as const, dots: [{ x: 177, y: 38 }, { x: 410, y: 120 }] },
  { name: 'UNION ELBOW', color: '#3B82F6', points: '177,56 410,138' as const, dots: [{ x: 177, y: 56 }, { x: 410, y: 138 }] },
  { name: 'MALE CONNECTOR', color: '#10B981', points: '177,120 410,158' as const, dots: [{ x: 177, y: 120 }, { x: 410, y: 158 }] },
];

const VENDORS = [
  { name: '외주사 A', sub: '가압검사 불량 최다', initial: 'A', rate: 28.5, rateLevel: 'high' as const, defects: 42, channels: 147, topPart: 'BULKHEAD UNION', concentration: 43.3, concColor: 'var(--gx-danger)', gradient: 'linear-gradient(135deg, #EF4444, #F87171)' },
  { name: '외주사 B', sub: '중간 수준 불량', initial: 'B', rate: 19.2, rateLevel: 'mid' as const, defects: 33, channels: 172, topPart: 'UNION ELBOW', concentration: 34.0, concColor: 'var(--gx-warning)', gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)' },
  { name: '외주사 C', sub: '양호 수준', initial: 'C', rate: 19.0, rateLevel: 'low' as const, defects: 22, channels: 116, topPart: 'MALE CONNECTOR', concentration: 22.7, concColor: 'var(--gx-success)', gradient: 'linear-gradient(135deg, #6366F1, #818CF8)' },
];

const RATE_COLOR: Record<string, string> = {
  high: 'var(--gx-danger)',
  mid: 'var(--gx-warning)',
  low: 'var(--gx-success)',
};

const TABS = ['가압검사', '제조품질', '통합비교', '주차별 분석'];
const maxDefect = Math.max(...RANKING_DATA.map(r => r.count));

/* ─── SVG Donut helpers ─── */
const DONUT_R = 82;
const CIRCUMFERENCE = 2 * Math.PI * DONUT_R; // ~515.22

function buildDonutSegments() {
  let offset = 0;
  return DONUT_PARTS.map(p => {
    const arc = (p.pct / 100) * CIRCUMFERENCE;
    const seg = { ...p, dashArray: `${arc} ${CIRCUMFERENCE - arc}`, dashOffset: -offset };
    offset += arc;
    return seg;
  });
}
const DONUT_SEGMENTS = buildDonutSegments();

/* ─── Component ─── */
export default function DefectAnalysisPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Layout title="불량 분석">
      <div style={{ padding: '28px 32px', maxWidth: '1440px' }}>

        {/* Status Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', background: 'var(--gx-white)',
          borderRadius: 'var(--radius-gx-lg)', boxShadow: 'var(--shadow-card)',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: 'var(--gx-success)',
              animation: 'pulse 2s infinite',
            }} />
            <div style={{ fontSize: '13px', color: 'var(--gx-slate)' }}>
              <strong style={{ color: 'var(--gx-charcoal)', fontWeight: 600 }}>GST 통합 검사 분석</strong>
              {' '}· 가압검사 + 제조품질 불량 현황
            </div>
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
            color: 'var(--gx-steel)', background: 'var(--gx-cloud)',
            padding: '4px 12px', borderRadius: 'var(--radius-gx-sm)',
          }}>
            2026-02-13 17:54:40 KST
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '24px',
          background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
          padding: '6px', boxShadow: 'var(--shadow-card)',
        }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setActiveTab(i)}
              style={{
                flex: 1, padding: '10px 24px', borderRadius: 'var(--radius-gx-md)',
                fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'pointer',
                textAlign: 'center', transition: 'all 0.15s',
                color: activeTab === i ? '#fff' : 'var(--gx-slate)',
                background: activeTab === i ? 'var(--gx-accent)' : 'transparent',
                boxShadow: activeTab === i ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {SAMPLE_KPI.map(k => {
            const ic = ICON_BG[k.variant];
            return (
              <div key={k.label} style={{
                background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
                padding: '22px 24px', boxShadow: 'var(--shadow-card)',
                transition: 'all 0.2s', cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--gx-steel)' }}>{k.label}</div>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: 'var(--radius-gx-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: ic.bg, color: ic.color,
                  }}>
                    {KPI_ICONS[k.variant]}
                  </div>
                </div>
                <div style={{
                  fontSize: '28px', fontWeight: 700, lineHeight: 1, marginBottom: '8px',
                  color: k.alert ? 'var(--gx-danger)' : 'var(--gx-charcoal)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {k.value}<span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--gx-steel)', marginLeft: '2px' }}>{k.unit}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--gx-slate)' }}>{k.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Charts: Donut + Ranking */}
        <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* Donut Chart */}
          <div style={{
            background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
            boxShadow: 'var(--shadow-card)', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>가압검사 부품별 전체 분포</div>
                <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>TOP 10 불량 부품</div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['전체 분포', '외주사별'].map((t, i) => (
                  <button key={t} style={{
                    padding: '5px 12px', borderRadius: 'var(--radius-gx-sm)',
                    fontSize: '12px', fontWeight: 500, border: 'none', cursor: 'pointer',
                    color: i === 0 ? 'var(--gx-accent)' : 'var(--gx-steel)',
                    background: i === 0 ? 'var(--gx-accent-soft)' : 'transparent',
                    transition: 'all 0.15s',
                  }}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ padding: '20px 24px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                {/* SVG Donut */}
                <div style={{ position: 'relative', width: '220px', height: '220px', flexShrink: 0 }}>
                  <svg style={{ transform: 'rotate(-90deg)' }} width="220" height="220" viewBox="0 0 220 220">
                    <circle cx="110" cy="110" r={DONUT_R} fill="none" stroke="var(--gx-mist)" strokeWidth="28"/>
                    {DONUT_SEGMENTS.map(s => (
                      <circle
                        key={s.name}
                        cx="110" cy="110" r={DONUT_R}
                        fill="none" stroke={s.color} strokeWidth="28"
                        strokeLinecap="round"
                        strokeDasharray={s.dashArray}
                        strokeDashoffset={s.dashOffset}
                        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
                      />
                    ))}
                  </svg>
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--gx-charcoal)', lineHeight: 1 }}>97</div>
                    <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '4px' }}>총 불량</div>
                  </div>
                </div>

                {/* Legend */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {DONUT_PARTS.map(p => (
                    <div key={p.name} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '5px 0', borderBottom: '1px solid var(--gx-cloud)',
                      transition: 'background 0.1s', cursor: 'default',
                    }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: p.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '12px', color: 'var(--gx-slate)', flex: 1 }}>{p.name}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 600, color: 'var(--gx-charcoal)', minWidth: '30px', textAlign: 'right' }}>
                        {p.count}건
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--gx-steel)', minWidth: '45px', textAlign: 'right' }}>
                        {p.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ranking */}
          <div style={{
            background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
            boxShadow: 'var(--shadow-card)', overflow: 'hidden',
          }}>
            <div style={{ padding: '20px 24px 0' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>불량 부품 순위</div>
              <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>건수 기준 상위 부품</div>
            </div>
            <div style={{ padding: '20px 24px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {RANKING_DATA.map((r, i) => {
                  const rs = RANK_STYLE[r.rank];
                  return (
                    <div key={r.part} style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '12px 0',
                      borderBottom: i < RANKING_DATA.length - 1 ? '1px solid var(--gx-cloud)' : 'none',
                    }}>
                      <div style={{
                        width: '26px', height: '26px', borderRadius: 'var(--radius-gx-sm)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 700, flexShrink: 0,
                        background: rs.bg, color: rs.color,
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>{r.part}</div>
                        <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>{r.meta}</div>
                      </div>
                      <div style={{ width: '120px' }}>
                        <div style={{ height: '6px', background: 'var(--gx-mist)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: '3px',
                            width: `${(r.count / maxDefect) * 100}%`,
                            background: rs.barColor,
                            transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                          }} />
                        </div>
                      </div>
                      <div style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize: '13px',
                        fontWeight: 600, minWidth: '40px', textAlign: 'right',
                        color: r.rank !== 'rest' ? rs.color : 'var(--gx-charcoal)',
                      }}>
                        {r.count}건
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Line Chart: Monthly Trend */}
        <div style={{
          background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)', overflow: 'hidden', marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>주요 부품별 월별 불량 추이</div>
              <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>미보증 포함 · 2026년</div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['월간', '주간'].map((t, i) => (
                <button key={t} style={{
                  padding: '5px 12px', borderRadius: 'var(--radius-gx-sm)',
                  fontSize: '12px', fontWeight: 500, border: 'none', cursor: 'pointer',
                  color: i === 0 ? 'var(--gx-accent)' : 'var(--gx-steel)',
                  background: i === 0 ? 'var(--gx-accent-soft)' : 'transparent',
                  transition: 'all 0.15s',
                }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ padding: '20px 24px 24px' }}>
            <svg viewBox="0 0 800 220" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '220px' }}>
              {/* Grid lines */}
              {[20, 70, 120, 170].map(y => (
                <line key={y} x1="60" y1={y} x2="760" y2={y} stroke="var(--gx-mist)" strokeWidth="1" strokeDasharray="4 4" />
              ))}
              <line x1="60" y1="200" x2="760" y2="200" stroke="var(--gx-mist)" strokeWidth="1" />

              {/* Y Labels */}
              {[{ y: 24, v: '10' }, { y: 74, v: '8' }, { y: 124, v: '5' }, { y: 174, v: '2' }, { y: 204, v: '0' }].map(l => (
                <text key={l.v} x="50" y={l.y} textAnchor="end" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fill: 'var(--gx-silver)' }}>{l.v}</text>
              ))}

              {/* X Labels */}
              <text x="177" y="218" textAnchor="middle" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fill: 'var(--gx-silver)' }}>1월</text>
              <text x="410" y="218" textAnchor="middle" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fill: 'var(--gx-silver)' }}>2월</text>

              {/* Data Lines */}
              {TREND_LINES.map(l => (
                <g key={l.name}>
                  <polyline points={l.points} fill="none" stroke={l.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {l.dots.map((d, di) => (
                    <circle key={di} cx={d.x} cy={d.y} r="4" fill={l.color} strokeWidth="2" stroke="var(--gx-white)" />
                  ))}
                </g>
              ))}
            </svg>

            {/* Trend Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', paddingTop: '16px' }}>
              {TREND_LINES.map(l => (
                <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '20px', height: '3px', borderRadius: '2px', background: l.color }} />
                  <span style={{ fontSize: '11px', color: 'var(--gx-slate)' }}>{l.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vendor Section Title */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>외주사별 불량 현황</div>
              <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>주요 3개 외주사 · 가압검사 기준</div>
            </div>
          </div>
        </div>

        {/* Vendor Cards */}
        <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {VENDORS.map(v => (
            <div
              key={v.name}
              style={{
                background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
                boxShadow: 'var(--shadow-card)', padding: '20px',
                transition: 'all 0.2s', cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.transform = 'none'; }}
            >
              {/* Header: icon + name + rate */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: 'var(--radius-gx-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 700, color: '#fff',
                    background: v.gradient,
                  }}>
                    {v.initial}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>{v.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>{v.sub}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '20px',
                    fontWeight: 700, color: RATE_COLOR[v.rateLevel],
                  }}>
                    {v.rate}%
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--gx-steel)', fontWeight: 400 }}>불량률</div>
                </div>
              </div>

              {/* Stats 2x2 grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
                paddingTop: '16px', borderTop: '1px solid var(--gx-cloud)',
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--gx-steel)' }}>불량 건수</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', fontWeight: 700, color: 'var(--gx-charcoal)', marginTop: '2px' }}>
                    {v.defects}<span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--gx-steel)' }}>건</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--gx-steel)' }}>검사 CH수</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', fontWeight: 700, color: 'var(--gx-charcoal)', marginTop: '2px' }}>
                    {v.channels}<span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--gx-steel)' }}>CH</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--gx-steel)' }}>주요 불량 부품</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 500, color: 'var(--gx-charcoal)', marginTop: '2px' }}>
                    {v.topPart}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--gx-steel)' }}>불량 집중도</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', fontWeight: 700, color: v.concColor, marginTop: '2px' }}>
                    {v.concentration}<span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--gx-steel)' }}>%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </Layout>
  );
}
