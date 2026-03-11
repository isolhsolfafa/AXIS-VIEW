// src/pages/ct/CtAnalysisPage.tsx
// CT 분석 — Task별 IQR 군집도 분석 (샘플 데이터)

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';

/* ─── Data ─── */
interface ProcessCard {
  name: string;
  variant: 'machinery' | 'electrical' | 'inspection' | 'etc';
  iqr: number;
  avg: number;
  icon: React.ReactNode;
  topColor: string;
  iconBg: string;
  iconColor: string;
  valueColor: string;
}

const PROCESS_CARDS: ProcessCard[] = [
  {
    name: '기구', variant: 'machinery', iqr: 0.0, avg: 0.0,
    topColor: 'var(--gx-silver)', iconBg: 'rgba(184,188,200,0.15)', iconColor: 'var(--gx-silver)',
    valueColor: 'var(--gx-silver)',
    icon: <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd"/></svg>,
  },
  {
    name: '전장', variant: 'electrical', iqr: 31.6, avg: 34.5,
    topColor: 'var(--gx-accent)', iconBg: 'var(--gx-accent-soft)', iconColor: 'var(--gx-accent)',
    valueColor: 'var(--gx-accent)',
    icon: <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>,
  },
  {
    name: '검사', variant: 'inspection', iqr: 4.6, avg: 4.4,
    topColor: 'var(--gx-success)', iconBg: 'var(--gx-success-bg)', iconColor: 'var(--gx-success)',
    valueColor: 'var(--gx-accent)',
    icon: <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>,
  },
  {
    name: '기타', variant: 'etc', iqr: 0.0, avg: 0.0,
    topColor: 'var(--gx-steel)', iconBg: 'rgba(139,144,160,0.1)', iconColor: 'var(--gx-steel)',
    valueColor: 'var(--gx-silver)',
    icon: <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zm6-6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>,
  },
];

interface TaskItem {
  task: string;
  iqr: number;
  avg: number;
  iqrBarPct: number;
  avgBarPct: number;
  confidence: 'high' | 'mid' | 'low';
  diff: number;
}

const ELEC_TASKS: TaskItem[] = [
  { task: '판넬 제작 작업', iqr: 9.4, avg: 9.5, iqrBarPct: 78, avgBarPct: 79, confidence: 'high', diff: -1.1 },
  { task: '판넬 취부 및 선분리', iqr: 6.0, avg: 6.4, iqrBarPct: 50, avgBarPct: 53, confidence: 'high', diff: -6.3 },
  { task: '탱크 도킹 후 결선 작업', iqr: 4.4, avg: 4.9, iqrBarPct: 37, avgBarPct: 41, confidence: 'mid', diff: -10.2 },
  { task: '프레임 전장 배선', iqr: 3.9, avg: 4.5, iqrBarPct: 33, avgBarPct: 38, confidence: 'mid', diff: -13.3 },
  { task: '메인 컨트롤러 설치', iqr: 3.0, avg: 3.5, iqrBarPct: 25, avgBarPct: 29, confidence: 'high', diff: -14.3 },
  { task: '센서 캘리브레이션', iqr: 2.5, avg: 2.6, iqrBarPct: 21, avgBarPct: 22, confidence: 'high', diff: -3.8 },
  { task: '최종 점검 및 라벨링', iqr: 2.4, avg: 3.1, iqrBarPct: 20, avgBarPct: 25, confidence: 'low', diff: -22.6 },
];

const INSPECT_TASKS: TaskItem[] = [
  { task: '가압 검사', iqr: 2.4, avg: 2.2, iqrBarPct: 52, avgBarPct: 48, confidence: 'high', diff: 9.1 },
  { task: '자주 검사', iqr: 1.6, avg: 1.7, iqrBarPct: 35, avgBarPct: 37, confidence: 'high', diff: -5.9 },
  { task: '외관 검사', iqr: 0.6, avg: 0.5, iqrBarPct: 13, avgBarPct: 11, confidence: 'mid', diff: 20.0 },
];

interface SectionMeta {
  badge: string;
  badgeBg: string;
  badgeColor: string;
  iqr: string;
  avg: string;
  samples: string;
  diff: string;
  tasks: TaskItem[];
}

const SECTIONS: SectionMeta[] = [
  {
    badge: '전장', badgeBg: 'var(--gx-accent-soft)', badgeColor: 'var(--gx-accent)',
    iqr: '31.6h', avg: '34.5h', samples: '192개', diff: '8.5%',
    tasks: ELEC_TASKS,
  },
  {
    badge: '검사', badgeBg: 'var(--gx-success-bg)', badgeColor: 'var(--gx-success)',
    iqr: '4.6h', avg: '4.4h', samples: '84개', diff: '4.5%',
    tasks: INSPECT_TASKS,
  },
];

const CONFIDENCE_STYLE = {
  high: { bg: 'var(--gx-success-bg)', color: 'var(--gx-success)', label: '신뢰도 높음' },
  mid: { bg: 'var(--gx-warning-bg)', color: 'var(--gx-warning)', label: '신뢰도 보통' },
  low: { bg: 'var(--gx-danger-bg)', color: 'var(--gx-danger)', label: '신뢰도 낮음' },
};

const MONTHS = ['2026년 01월', '2025년 12월', '2025년 11월', '2025년 10월'];
const MODELS = ['DRAGON', 'PHOENIX', 'TITAN', '전체 모델'];

/* ─── Component ─── */
export default function CtAnalysisPage() {
  const [periodMode, setPeriodMode] = useState(0);

  return (
    <Layout title="CT 분석">
      <div style={{ padding: '28px 32px', maxWidth: '1600px' }}>

        {/* Filter Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
          padding: '16px 20px', background: 'var(--gx-white)',
          borderRadius: 'var(--radius-gx-lg)', boxShadow: 'var(--shadow-card)',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gx-steel)', whiteSpace: 'nowrap' }}>분석 기간</span>
            <div style={{ display: 'flex', background: 'var(--gx-cloud)', borderRadius: 'var(--radius-gx-sm)', overflow: 'hidden' }}>
              {['단일월', '기간합산'].map((t, i) => (
                <button
                  key={t}
                  onClick={() => setPeriodMode(i)}
                  style={{
                    padding: '6px 14px', fontSize: '12px', fontWeight: 500, border: 'none', cursor: 'pointer',
                    background: periodMode === i ? 'var(--gx-accent)' : 'none',
                    color: periodMode === i ? '#fff' : 'var(--gx-slate)',
                    borderRadius: periodMode === i ? 'var(--radius-gx-sm)' : '0',
                    transition: 'all 0.15s',
                  }}
                >{t}</button>
              ))}
            </div>
          </div>

          <div style={{ width: '1px', height: '28px', background: 'var(--gx-mist)', margin: '0 4px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gx-steel)', whiteSpace: 'nowrap' }}>분석 월</span>
            <select style={{
              padding: '7px 28px 7px 12px', borderRadius: 'var(--radius-gx-sm)',
              border: '1px solid var(--gx-mist)', background: 'var(--gx-white)',
              fontSize: '12.5px', fontWeight: 500, color: 'var(--gx-graphite)',
              fontFamily: 'inherit', cursor: 'pointer',
              appearance: 'none', WebkitAppearance: 'none',
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238B90A0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
            }}>
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div style={{ width: '1px', height: '28px', background: 'var(--gx-mist)', margin: '0 4px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gx-steel)', whiteSpace: 'nowrap' }}>모델</span>
            <select style={{
              padding: '7px 28px 7px 12px', borderRadius: 'var(--radius-gx-sm)',
              border: '1px solid var(--gx-mist)', background: 'var(--gx-white)',
              fontSize: '12.5px', fontWeight: 500, color: 'var(--gx-graphite)',
              fontFamily: 'inherit', cursor: 'pointer',
              appearance: 'none', WebkitAppearance: 'none',
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238B90A0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
            }}>
              {MODELS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div style={{ width: '1px', height: '28px', background: 'var(--gx-mist)', margin: '0 4px' }} />

          <button style={{
            padding: '7px 16px', borderRadius: 'var(--radius-gx-sm)',
            border: '1px solid var(--gx-accent)', background: 'var(--gx-accent)',
            color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit', transition: 'all 0.15s',
          }}>분석 실행</button>
        </div>

        {/* Section Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gx-charcoal)' }}>
            DRAGON — 2026-01 Task별 분석
          </div>
          <div style={{
            padding: '4px 10px', borderRadius: 'var(--radius-gx-sm)',
            background: 'var(--gx-accent-soft)', color: 'var(--gx-accent)',
            fontSize: '11px', fontWeight: 600,
          }}>IQR 군집도</div>
        </div>

        {/* Process Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {PROCESS_CARDS.map(p => (
            <div
              key={p.name}
              style={{
                background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
                boxShadow: 'var(--shadow-card)', padding: '20px',
                position: 'relative', overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
            >
              {/* Top color bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: p.topColor }} />

              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gx-slate)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: 'var(--radius-gx-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: p.iconBg, color: p.iconColor,
                }}>
                  {p.icon}
                </div>
                {p.name}
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '10px', fontWeight: 500, color: 'var(--gx-steel)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>IQR 시간</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '22px', fontWeight: 500, lineHeight: 1, color: p.valueColor }}>
                    {p.iqr.toFixed(1)}<span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--gx-steel)', marginLeft: '2px' }}>h</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '10px', fontWeight: 500, color: 'var(--gx-steel)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>평균 시간</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '22px', fontWeight: 500, lineHeight: 1, color: p.iqr === 0 ? 'var(--gx-silver)' : 'var(--gx-graphite)' }}>
                    {p.avg.toFixed(1)}<span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--gx-steel)', marginLeft: '2px' }}>h</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend Strip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '20px',
          padding: '12px 20px', background: 'var(--gx-white)',
          borderRadius: 'var(--radius-gx-lg)', boxShadow: 'var(--shadow-card)',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--gx-slate)', fontWeight: 500 }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--gx-accent)' }} />
            IQR 군집도 시간
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--gx-slate)', fontWeight: 500 }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--gx-success)' }} />
            기존 평균시간
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--gx-slate)', fontWeight: 500, marginLeft: 'auto' }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="var(--gx-steel)"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
            IQR(사분위범위)은 이상값을 제거한 군집 중심값입니다
          </div>
        </div>

        {/* Detail Sections */}
        {SECTIONS.map(section => (
          <div key={section.badge} style={{
            background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
            boxShadow: 'var(--shadow-card)', overflow: 'hidden', marginBottom: '24px',
          }}>
            {/* Section Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: '1px solid var(--gx-mist)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-gx-sm)',
                  fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px',
                  background: section.badgeBg, color: section.badgeColor,
                }}>{section.badge}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-slate)' }}>총합</div>
              </div>
              <div style={{ display: 'flex', gap: '24px' }}>
                {[
                  { label: 'IQR', value: section.iqr, cls: 'var(--gx-accent)' },
                  { label: '평균', value: section.avg, cls: 'var(--gx-graphite)' },
                  { label: '샘플', value: section.samples, cls: 'var(--gx-success)' },
                  { label: '차이', value: section.diff, cls: 'var(--gx-warning)' },
                ].map(c => (
                  <div key={c.label} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 14px', borderRadius: '20px',
                    background: 'var(--gx-cloud)', fontSize: '12px',
                  }}>
                    <span style={{ color: 'var(--gx-steel)', fontWeight: 500 }}>{c.label}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: '13px', color: c.cls }}>{c.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Task List */}
            <div style={{ padding: '16px 24px 24px' }}>
              {section.tasks.map((t, i) => {
                const isTop = i < 3 && section.tasks.length > 3;
                const conf = CONFIDENCE_STYLE[t.confidence];
                const diffColor = t.diff < 0 ? 'var(--gx-success)' : 'var(--gx-danger)';
                return (
                  <div key={t.task} style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '14px 0',
                    borderBottom: i < section.tasks.length - 1 ? '1px solid var(--gx-cloud)' : 'none',
                  }}>
                    {/* Rank */}
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, flexShrink: 0,
                      background: isTop ? 'var(--gx-accent-soft)' : 'var(--gx-cloud)',
                      color: isTop ? 'var(--gx-accent)' : 'var(--gx-steel)',
                    }}>{i + 1}</div>

                    {/* Task Name */}
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 500, color: 'var(--gx-charcoal)', lineHeight: 1.3 }}>
                      {t.task}
                    </div>

                    {/* Bar Area */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '56px', fontSize: '10px', fontWeight: 500, color: 'var(--gx-steel)', textAlign: 'right', flexShrink: 0 }}>IQR</span>
                        <div style={{ flex: 1, height: '20px', background: 'var(--gx-cloud)', borderRadius: 'var(--radius-gx-sm)', overflow: 'hidden', position: 'relative' }}>
                          <div style={{
                            height: '100%', borderRadius: 'var(--radius-gx-sm)',
                            background: 'var(--gx-accent)',
                            width: `${t.iqrBarPct}%`, minWidth: '50px',
                            display: 'flex', alignItems: 'center', paddingLeft: '10px',
                            fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 500, color: '#fff',
                            transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                          }}>{t.iqr}h</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '56px', fontSize: '10px', fontWeight: 500, color: 'var(--gx-steel)', textAlign: 'right', flexShrink: 0 }}>평균</span>
                        <div style={{ flex: 1, height: '20px', background: 'var(--gx-cloud)', borderRadius: 'var(--radius-gx-sm)', overflow: 'hidden', position: 'relative' }}>
                          <div style={{
                            height: '100%', borderRadius: 'var(--radius-gx-sm)',
                            background: 'var(--gx-success)',
                            width: `${t.avgBarPct}%`, minWidth: '50px',
                            display: 'flex', alignItems: 'center', paddingLeft: '10px',
                            fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 500, color: '#fff',
                            transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                          }}>{t.avg}h</div>
                        </div>
                      </div>
                    </div>

                    {/* Time Values */}
                    <div style={{ width: '100px', flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 500, color: 'var(--gx-accent)' }}>{t.iqr}h</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 500, color: 'var(--gx-success)' }}>{t.avg}h</span>
                    </div>

                    {/* Meta: confidence + diff */}
                    <div style={{ width: '120px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '10px',
                        fontSize: '10px', fontWeight: 600,
                        background: conf.bg, color: conf.color,
                      }}>{conf.label}</span>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 500,
                        color: diffColor,
                      }}>{t.diff > 0 ? '+' : ''}{t.diff}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      </div>
    </Layout>
  );
}
